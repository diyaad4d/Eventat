const db = require('../db');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE
// payments:             payment_id, event_id, method_id, amount, currency,
//                       status('pending','completed','failed','refunded'),
//                       transaction_ref, paid_at, created_at
// escrow_transactions:  escrow_id, payment_id, vendor_id, event_item_id,
//                       amount_held, platform_fee, amount_payable,
//                       status('held','released','refunded','disputed'),
//                       released_at, created_at
// payment_methods:      method_id, name, provider, is_active, created_at
// ---------------------------------------------------------------------------

const PLATFORM_FEE_PERCENT = 0.10; // 10% platform commission (deducted from vendor after event)
const DEPOSIT_PERCENT      = 0.20; // 20% online deposit for cash_deposit method

// ── Helper: generate a unique transaction reference ──────────────────────────
const generateTxRef = () => {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EVT-${ts}-${rnd}`;
};

// ── Helper: send a notification without failing the main operation ────────────
const sendNotification = async ({ userId, eventId = null, title, messageBody, notificationType, actionUrl }) => {
  try {
    await db.query(
      `INSERT INTO notifications
         (user_id, event_id, title, message_body, notification_type, action_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, eventId, title, messageBody, notificationType, actionUrl]
    );
  } catch (err) {
    console.error('[Notification Error]', err.message);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 1: POST /api/event-plans/:id/pay
// Process a payment for a confirmed event plan
// Body: { payment_method: 'credit_card' | 'cash_deposit' }
// ---------------------------------------------------------------------------
const payEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId     = parseInt(req.params.id, 10);
    const { payment_method = 'full_online' } = req.body;

    // ── Step 1: Verify plan ownership and it is confirmed ──────────────────
    const planRes = await db.query(
      `SELECT * FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = planRes.rows[0];

    if (plan.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This plan does not belong to you.' });
    }

    if (plan.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: `Only confirmed plans can be paid. Current status: ${plan.status}`,
        code: 'PLAN_NOT_CONFIRMED',
      });
    }

    // ── Step 2: Check no existing completed payment for this plan ──────────
    const existingPayment = await db.query(
      `SELECT payment_id, status FROM payments WHERE event_id = $1 AND status = 'completed'`,
      [planId]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This event plan has already been paid.',
        code: 'ALREADY_PAID',
      });
    }

    // ── Step 3: Fetch all accepted items to split escrow per vendor ─────────
    const itemsRes = await db.query(
      `SELECT
         epi.event_item_id,
         epi.line_total,
         s.vendor_id,
         COALESCE(vp.company_name, u.full_name) AS vendor_name
       FROM event_plan_items epi
       JOIN services s          ON epi.service_id = s.service_id
       JOIN vendor_profiles vp  ON s.vendor_id    = vp.vendor_id
       JOIN users u             ON vp.vendor_id   = u.user_id
       WHERE epi.event_id = $1
         AND epi.vendor_item_status = 'accepted'`,
      [planId]
    );

    if (itemsRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No accepted services found in this plan.',
        code: 'NO_ACCEPTED_ITEMS',
      });
    }

    const acceptedItems = itemsRes.rows;
    const fullSubtotal  = acceptedItems.reduce((sum, i) => sum + parseFloat(i.line_total), 0);

    // ── Step 4: Compute how much the customer pays NOW ─────────────────────
    // full_online  → 100% of subtotal paid now; escrow holds 100% per item
    // cash_deposit → 20% deposit paid now; escrow holds 20% per item;
    //                remaining 80% paid in cash directly to vendor on event day
    const isCashDeposit  = payment_method === 'cash_deposit';
    const depositRatio   = isCashDeposit ? DEPOSIT_PERCENT : 1.0;
    const totalAmount    = parseFloat((fullSubtotal * depositRatio).toFixed(2));

    // ── Step 5: Resolve method_id from payment_methods table ───────────────
    // Upsert the payment method so it always exists
    const methodName = payment_method === 'cash_deposit' ? 'Cash Deposit' : 'Credit Card';
    const methodProvider = payment_method === 'cash_deposit' ? 'cash' : 'card';

    let methodRow = await db.query(
      `SELECT method_id FROM payment_methods WHERE provider = $1 AND is_active = true`,
      [methodProvider]
    );

    if (methodRow.rows.length === 0) {
      methodRow = await db.query(
        `INSERT INTO payment_methods (name, provider, is_active) VALUES ($1, $2, true) RETURNING method_id`,
        [methodName, methodProvider]
      );
    }

    const methodId = methodRow.rows[0].method_id;

    // ── Step 5: DB Transaction — create payment + escrow + update plan ──────
    await db.query('BEGIN');

    let paymentRecord;
    try {
      // 5a: Create the payment record
      const payRes = await db.query(
        `INSERT INTO payments
           (event_id, method_id, amount, currency, status, transaction_ref, paid_at)
         VALUES ($1, $2, $3, 'JOD', 'completed', $4, NOW())
         RETURNING *`,
        [planId, methodId, totalAmount.toFixed(2), generateTxRef()]
      );
      paymentRecord = payRes.rows[0];

      // 5b: Create escrow transactions — one per accepted item
      for (const item of acceptedItems) {
        // For full_online: hold 100% of line_total in escrow
        // For cash_deposit: hold only the deposit portion (20%) — the 80% cash
        //   goes directly to vendor on event day and never touches escrow
        const amountHeld    = parseFloat((parseFloat(item.line_total) * depositRatio).toFixed(2));
        const platformFee   = parseFloat((parseFloat(item.line_total) * PLATFORM_FEE_PERCENT).toFixed(2));
        const amountPayable = parseFloat((amountHeld - platformFee).toFixed(2));

        await db.query(
          `INSERT INTO escrow_transactions
             (payment_id, vendor_id, event_item_id, amount_held, platform_fee, amount_payable, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'held')`,
          [paymentRecord.payment_id, item.vendor_id, item.event_item_id, amountHeld, platformFee, amountPayable]
        );
      }

      // 5c: Mark all accepted items as 'paid'
      await db.query(
        `UPDATE event_plan_items
         SET vendor_item_status = 'paid'
         WHERE event_id = $1 AND vendor_item_status = 'accepted'`,
        [planId]
      );

      // 5d: Move event plan to 'paid'
      await db.query(
        `UPDATE event_plans SET status = 'paid', updated_at = NOW() WHERE event_id = $1`,
        [planId]
      );

      await db.query('COMMIT');
    } catch (txErr) {
      await db.query('ROLLBACK');
      throw txErr;
    }

    // ── Step 6: Notify all involved vendors (non-blocking) ─────────────────
    const customerRes = await db.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [customerId]
    );
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    const distinctVendors = [...new Set(acceptedItems.map(i => i.vendor_id))];
    for (const vendorId of distinctVendors) {
      await sendNotification({
        userId: vendorId,
        eventId: planId,
        title: 'Payment Received!',
        messageBody: `${customerName} has paid for their event plan "${plan.name}". Your funds are held in escrow and will be released after the event.`,
        notificationType: 'payment_received',
        actionUrl: '/vendor/bookings',
      });
    }

    // ── Step 7: Notify customer (payment receipt) ──────────────────────────
    await sendNotification({
      userId: customerId,
      eventId: planId,
      title: 'Payment Successful',
      messageBody: `Your payment of ${totalAmount.toFixed(2)} JOD for "${plan.name}" was successful. Ref: ${paymentRecord.transaction_ref}`,
      notificationType: 'payment_success',
      actionUrl: '/customer/events',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully.',
      data: {
        payment: {
          ...paymentRecord,
          escrow_count: acceptedItems.length,
          platform_fee_percent: PLATFORM_FEE_PERCENT * 100,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: GET /api/event-plans/:id/payment
// Get the payment record + escrow breakdown for a plan
// ---------------------------------------------------------------------------
const getEventPlanPayment = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId     = parseInt(req.params.id, 10);

    // Verify ownership
    const planRes = await db.query(
      `SELECT event_id, customer_id, name, status FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    if (planRes.rows[0].customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    // Get payment record
    const payRes = await db.query(
      `SELECT p.*, pm.name AS method_name, pm.provider
       FROM payments p
       LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
       WHERE p.event_id = $1
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [planId]
    );

    if (payRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No payment found for this plan.', code: 'PAYMENT_NOT_FOUND' });
    }

    const payment = payRes.rows[0];

    // Get escrow breakdown
    const escrowRes = await db.query(
      `SELECT
         et.escrow_id, et.amount_held, et.platform_fee, et.amount_payable,
         et.status, et.released_at,
         COALESCE(vp.company_name, u.full_name) AS vendor_name,
         s.title AS service_title
       FROM escrow_transactions et
       JOIN users u            ON et.vendor_id    = u.user_id
       JOIN vendor_profiles vp ON et.vendor_id    = vp.vendor_id
       JOIN event_plan_items epi ON et.event_item_id = epi.event_item_id
       JOIN services s         ON epi.service_id  = s.service_id
       WHERE et.payment_id = $1
       ORDER BY et.created_at ASC`,
      [payment.payment_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        payment: {
          ...payment,
          escrow: escrowRes.rows,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 3: POST /api/event-plans/:id/complete
// Mark event as complete and release escrow to vendors
// ---------------------------------------------------------------------------
const completeEventPlanInternal = async (planId) => {
  const planRes = await db.query(
    `SELECT event_id, customer_id, name, status FROM event_plans WHERE event_id = $1`,
    [planId]
  );

  if (planRes.rows.length === 0) {
    throw new Error('Event plan not found.');
  }

  const plan = planRes.rows[0];

  if (plan.status !== 'paid') {
    throw new Error(`Only paid plans can be marked complete. Current status: ${plan.status}`);
  }

  // Begin transaction for escrow release
  await db.query('BEGIN');
  try {
    // 1. Get the payment ID for this plan
    const payRes = await db.query(
      `SELECT payment_id FROM payments WHERE event_id = $1 AND status = 'completed'`,
      [planId]
    );
    
    if (payRes.rows.length === 0) {
      throw new Error('No completed payment found for this paid plan.');
    }
    const paymentId = payRes.rows[0].payment_id;

    // 2. Release all escrow transactions tied to this payment
    const escrowRes = await db.query(
      `UPDATE escrow_transactions 
       SET status = 'released', released_at = NOW() 
       WHERE payment_id = $1 AND status = 'held'
       RETURNING vendor_id, amount_payable`,
      [paymentId]
    );

    // 3. Mark plan items as completed
    await db.query(
      `UPDATE event_plan_items 
       SET vendor_item_status = 'completed' 
       WHERE event_id = $1 AND vendor_item_status = 'paid'`,
      [planId]
    );

    // 4. Mark plan as completed
    await db.query(
      `UPDATE event_plans SET status = 'completed', updated_at = NOW() WHERE event_id = $1`,
      [planId]
    );

    await db.query('COMMIT');

    // 5. Notify vendors (non-blocking)
    const releasedEscrows = escrowRes.rows;
    const customerRes = await db.query(`SELECT full_name FROM users WHERE user_id = $1`, [plan.customer_id]);
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    for (const escrow of releasedEscrows) {
      await sendNotification({
        userId: escrow.vendor_id,
        eventId: planId,
        title: 'Funds Released! 🎉',
        messageBody: `${customerName} marked the event "${plan.name}" as complete. ${parseFloat(escrow.amount_payable).toFixed(2)} JOD has been released to your available balance.`,
        notificationType: 'event_completed',
        actionUrl: '/vendor/payment', // vendors will have a payment/earnings page
      });
    }

    return { success: true };
  } catch (txErr) {
    await db.query('ROLLBACK');
    throw txErr;
  }
};

const completeEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId     = parseInt(req.params.id, 10);

    const planRes = await db.query(
      `SELECT customer_id FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.' });
    }

    if (planRes.rows[0].customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    await completeEventPlanInternal(planId);

    return res.status(200).json({
      success: true,
      message: 'Event marked as complete. Funds have been released to vendors.',
    });
  } catch (err) {
    if (err.message.includes('Only paid plans') || err.message.includes('No completed payment')) {
       return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

module.exports = {
  payEventPlan,
  getEventPlanPayment,
  completeEventPlan,
  completeEventPlanInternal,
};
