const db = require('../db');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE (exact column names from 001_initial_schema.sql)
//
// event_plans:
//   PK:            event_id
//   customer FK:   customer_id
//   name column:   name  (NOT 'title')
//   status ENUM:   'draft','submitted','confirmed','completed','cancelled'
//   other cols:    event_type_id, estimated_total_cost, created_at, updated_at
//   NOTE: NO event_date, NO notes columns on event_plans!
//
// event_plan_items:
//   PK:            event_item_id
//   plan FK:       event_id
//   service FK:    service_id
//   status col:    vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
//   price cols:    unit_price_at_time, line_total
//   other cols:    event_date, guest_count, special_requests, quantity (default 1)
//   NOTE: NO payment_method on items. NO updated_at on items!
//         Payment is handled via separate payments table.
//
// services: PK service_id, vendor FK vendor_id, base_price, is_active, title
// vendor_profiles: PK vendor_id (= user_id), registration_status
// notifications: user_id, event_id, title, message_body, notification_type, action_url
// users: user_id, full_name, email, role (avatar_url is on customer_profiles, not users)
// ---------------------------------------------------------------------------




// HELPER — primary image subquery (mirrors services.controller.js)
const primaryImageSubquery = (alias = 's') => `(
  SELECT si.image_url
  FROM service_images si
  WHERE si.service_id = ${alias}.service_id
  ORDER BY si.is_primary DESC, si.sort_order ASC
  LIMIT 1
)`;




// HELPER — send a notification without failing the main operation
const sendNotification = async ({ userId, eventId = null, title, messageBody, notificationType, actionUrl }) => {
  try {
    await db.query(
      `INSERT INTO notifications
         (user_id, event_id, title, message_body, notification_type, action_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, eventId, title, messageBody, notificationType, actionUrl]
    );
  } catch (notifErr) {
    // Non-blocking — log but never fail the main operation
    console.error('[Notification Error]', notifErr.message);
  }
};





// FUNCTION 1: POST /api/bookings
// Direct Book Now — auto-creates event_plan + event_plan_item
const createDirectBooking = async (req, res, next) => {
  try {
    const {
      service_id,
      event_date,
      guest_count,
      special_requests,
      quantity = 1,
    } = req.body;

    // payment_method not stored on items  kept for business logic reference only
    // (the route validates it is 'full_online' or 'cash_deposit')

    const customerId = req.user.user_id;
    const qty = parseInt(quantity) || 1;

    //  Step 1: Verify service exists, is active, vendor is approved 
    const serviceRes = await db.query(
      `SELECT
         s.service_id,
         s.title,
         s.base_price,
         s.pricing_unit,
         s.vendor_id,
         vp.registration_status,
         COALESCE(vp.company_name, u.full_name) AS vendor_name
       FROM services s
       JOIN vendor_profiles vp ON s.vendor_id = vp.vendor_id
       JOIN users u ON vp.vendor_id = u.user_id
       WHERE s.service_id = $1
         AND s.is_active = true
         AND vp.registration_status = 'approved'`,
      [service_id]
    );

    if (serviceRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not available.',
        code: 'SERVICE_NOT_FOUND',
      });
    }
    const service = serviceRes.rows[0];

    //  Step 2: Prevent vendor from booking their own service 
    if (service.vendor_id === customerId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot book your own service.',
      });
    }

    //  Step 3: Calculate pricing 
    const unit_price_at_time = parseFloat(service.base_price);
    const line_total = unit_price_at_time * qty;


    //  Step 4: DB Transaction 
    await db.query('BEGIN');

    let plan, item;
    try {
      // Step 4a: Auto-create event_plan (status='submitted', no event_date col on plans)
      const planRes = await db.query(
        `INSERT INTO event_plans
           (customer_id, name, status, estimated_total_cost)
         VALUES ($1, $2, 'submitted', $3)
         RETURNING *`,
        [
          customerId,
          `Booking for ${service.title}`,
          line_total,
        ]
      );
      plan = planRes.rows[0];

      // Step 4b: Create event_plan_item
      // Note: NO payment_method column on event_plan_items in schema.
      // Note: NO vendor FK directly on items — derived via service.vendor_id.
      const itemRes = await db.query(
        `INSERT INTO event_plan_items
           (event_id, service_id, event_date, guest_count,
            special_requests, quantity, unit_price_at_time,
            line_total, vendor_item_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING *`,
        [
          plan.event_id,
          service_id,
          event_date,
          guest_count || null,
          special_requests || null,
          qty,
          unit_price_at_time,
          line_total,
        ]
      );
      item = itemRes.rows[0];

      await db.query('COMMIT');
    } catch (txErr) {
      await db.query('ROLLBACK');
      throw txErr;
    }

    //  Step 5: Notify vendor (non-blocking) 
    const customerRes = await db.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [customerId]
    );
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    await sendNotification({
      userId: service.vendor_id,
      eventId: plan.event_id,
      title: 'New Booking Request',
      messageBody: `${customerName} booked "${service.title}".`,
      notificationType: 'booking_new',
      actionUrl: '/vendor/bookings',
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking: {
          ...item,
          plan_id: plan.event_id,
          service_title: service.title,
          vendor_name: service.vendor_name,
          total_amount: line_total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};







// FUNCTION 2: GET /api/bookings/my
// Customer's all booking items across all plans
const getMyBookings = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;

    const { status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Validate status value against schema ENUM
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowedStatuses.join(', ')}.`,
      });
    }

    const params = [customerId];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = `AND epi.vendor_item_status = $${params.length}`;
    }

    params.push(limit);
    const limitParam = params.length;
    params.push(offset);
    const offsetParam = params.length;

    const sql = `
      SELECT
        epi.event_item_id,
        epi.vendor_item_status   AS status,
        epi.event_date,
        epi.guest_count,
        epi.special_requests,
        epi.unit_price_at_time,
        epi.quantity,
        epi.line_total,
        epi.vendor_note,
        epi.created_at,
        ep.event_id              AS plan_id,
        ep.name                  AS plan_name,
        ep.status                AS plan_status,
        s.service_id,
        s.title                  AS service_title,
        s.city                   AS service_city,
        s.pricing_unit,
        ${primaryImageSubquery('s')} AS primary_image_url,
        COALESCE(vp.company_name, u.full_name) AS vendor_name,
        vp.vendor_id,
        COUNT(*) OVER()          AS total_count
      FROM event_plan_items epi
      JOIN event_plans ep    ON epi.event_id    = ep.event_id
      JOIN services s        ON epi.service_id  = s.service_id
      JOIN vendor_profiles vp ON s.vendor_id    = vp.vendor_id
      JOIN users u            ON vp.vendor_id   = u.user_id
      WHERE ep.customer_id = $1
        ${statusClause}
      ORDER BY epi.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await db.query(sql, params);

    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const bookings   = result.rows.map(({ total_count, ...row }) => row);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 3: GET /api/bookings/:id
// Single booking item detail — must belong to this customer
const getBookingById = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const itemId = parseInt(req.params.id, 10);

    // Main query with ownership check via event_plans.customer_id
    const result = await db.query(
      `SELECT
         epi.event_item_id,
         epi.vendor_item_status   AS status,
         epi.event_date,
         epi.guest_count,
         epi.special_requests,
         epi.unit_price_at_time,
         epi.quantity,
         epi.line_total,
         epi.vendor_note,
         epi.created_at,
         ep.event_id              AS plan_id,
         ep.name                  AS plan_name,
         ep.status                AS plan_status,
         ep.estimated_total_cost  AS plan_total,
         s.service_id,
         s.title                  AS service_title,
         s.description            AS service_description,
         s.city                   AS service_city,
         s.pricing_unit,
         s.capacity,
         COALESCE(vp.company_name, u.full_name) AS vendor_name,
         vp.vendor_id,
         u.user_id                AS vendor_user_id
       FROM event_plan_items epi
       JOIN event_plans ep    ON epi.event_id   = ep.event_id
       JOIN services s        ON epi.service_id = s.service_id
       JOIN vendor_profiles vp ON s.vendor_id   = vp.vendor_id
       JOIN users u            ON vp.vendor_id  = u.user_id
       WHERE epi.event_item_id = $1
         AND ep.customer_id    = $2`,
      [itemId, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found.',
        code: 'BOOKING_NOT_FOUND',
      });
    }

    const booking = result.rows[0];

    // Fetch all service images
    const imagesRes = await db.query(
      `SELECT image_id, image_url, is_primary, sort_order
       FROM service_images
       WHERE service_id = $1
       ORDER BY is_primary DESC, sort_order ASC`,
      [booking.service_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        booking: {
          ...booking,
          service_images: imagesRes.rows,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 4: PATCH /api/bookings/:id/cancel
// Customer cancels a booking item
const cancelBooking = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const itemId = parseInt(req.params.id, 10);

    // Step 1: Find item and verify ownership
    const findRes = await db.query(
      `SELECT epi.event_item_id, epi.vendor_item_status, epi.event_id,
              s.vendor_id AS vendor_user_id, s.title AS service_title,
              ep.customer_id
       FROM event_plan_items epi
       JOIN event_plans ep  ON epi.event_id   = ep.event_id
       JOIN services s      ON epi.service_id = s.service_id
       WHERE epi.event_item_id = $1`,
      [itemId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
    }

    const item = findRes.rows[0];

    if (item.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This booking does not belong to you.' });
    }

    // Step 2: Check cancellability
    if (item.vendor_item_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'This booking is already cancelled.' });
    }
    if (item.vendor_item_status === 'rejected') {
      return res.status(400).json({ success: false, error: 'This booking was already rejected.' });
    }
    if (item.vendor_item_status === 'completed') {
      return res.status(400).json({ success: false, error: 'Cannot cancel a completed booking.' });
    }

    // Step 3: Update status to cancelled
    // NOTE: event_plan_items has NO updated_at column in schema
    const updateRes = await db.query(
      `UPDATE event_plan_items
       SET vendor_item_status = 'cancelled'
       WHERE event_item_id = $1
       RETURNING *`,
      [itemId]
    );

    const updatedItem = updateRes.rows[0];

    // Step 4: Notify vendor (non-blocking)
    const customerRes = await db.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [customerId]
    );
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    await sendNotification({
      userId: item.vendor_user_id,
      eventId: item.event_id,
      title: 'Booking Cancelled',
      messageBody: `${customerName} cancelled their booking for "${item.service_title}".`,
      notificationType: 'booking_cancelled',
      actionUrl: '/vendor/bookings',
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: { booking: updatedItem },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 5: POST /api/event-plans
// Create empty event plan (Cart)
const createEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const { name, event_type_id } = req.body;

    // 'name' is the column on event_plans (NOT 'title')
    // NOTE: event_plans has NO event_date or notes columns in schema
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Plan name is required.' });
    }

    const result = await db.query(
      `INSERT INTO event_plans
         (customer_id, name, status, event_type_id, estimated_total_cost)
       VALUES ($1, $2, 'draft', $3, 0)
       RETURNING *`,
      [customerId, name.trim(), event_type_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Event plan created.',
      data: { plan: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 6: GET /api/event-plans/my
// All customer's event plans with item counts
const getMyEventPlans = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const { status } = req.query;

    const allowedStatuses = ['draft', 'submitted', 'confirmed', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowedStatuses.join(', ')}.`,
      });
    }

    const params = [customerId];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = `AND ep.status = $${params.length}`;
    }

    // Use correlated subqueries instead of GROUP BY + LEFT JOIN to avoid
    // having to list every column in GROUP BY (per SQL rules).
    const sql = `
      SELECT
        ep.event_id,
        ep.customer_id,
        ep.event_type_id,
        ep.name,
        ep.status,
        ep.estimated_total_cost,
        ep.created_at,
        ep.updated_at,
        (SELECT COUNT(*) FROM event_plan_items epi
         WHERE epi.event_id = ep.event_id) AS items_count,
        (SELECT COUNT(*) FROM event_plan_items epi
         WHERE epi.event_id = ep.event_id
           AND epi.vendor_item_status = 'accepted') AS confirmed_count,
        (SELECT COUNT(*) FROM event_plan_items epi
         WHERE epi.event_id = ep.event_id
           AND epi.vendor_item_status = 'pending') AS pending_count
      FROM event_plans ep
      WHERE ep.customer_id = $1
        ${statusClause}
      ORDER BY ep.created_at DESC
    `;

    const result = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      data: { plans: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 7: GET /api/event-plans/:id
// Single plan with all its items
const getEventPlanById = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId = parseInt(req.params.id, 10);

    // Query A: Get plan + verify ownership
    const planRes = await db.query(
      `SELECT * FROM event_plans
       WHERE event_id = $1 AND customer_id = $2`,
      [planId, customerId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event plan not found.',
        code: 'PLAN_NOT_FOUND',
      });
    }

    const plan = planRes.rows[0];

    // Query B: All items in the plan with full service + vendor info
    const itemsRes = await db.query(
      `SELECT
         epi.event_item_id,
         epi.vendor_item_status   AS status,
         epi.event_date,
         epi.guest_count,
         epi.special_requests,
         epi.unit_price_at_time,
         epi.quantity,
         epi.line_total,
         epi.vendor_note,
         epi.created_at,
         s.service_id,
         s.title                  AS service_title,
         s.city                   AS service_city,
         s.pricing_unit,
         ${primaryImageSubquery('s')} AS primary_image_url,
         COALESCE(vp.company_name, u.full_name) AS vendor_name,
         vp.vendor_id
       FROM event_plan_items epi
       JOIN services s        ON epi.service_id = s.service_id
       JOIN vendor_profiles vp ON s.vendor_id   = vp.vendor_id
       JOIN users u            ON vp.vendor_id  = u.user_id
       WHERE epi.event_id = $1
       ORDER BY epi.created_at ASC`,
      [planId]
    );

    return res.status(200).json({
      success: true,
      data: {
        plan: {
          ...plan,
          items: itemsRes.rows,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 8: PATCH /api/event-plans/:id
// Update plan name — only 'draft' plans can be edited
// NOTE: event_plans has only: event_id, customer_id, event_type_id,
//       name, status, estimated_total_cost, created_at, updated_at
//       (NO event_date or notes columns)
const updateEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId = parseInt(req.params.id, 10);
    const { name, event_type_id } = req.body;

    // Step 1: Find plan + verify ownership + editable
    const findRes = await db.query(
      `SELECT * FROM event_plans WHERE event_id = $1 AND customer_id = $2`,
      [planId, customerId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = findRes.rows[0];

    if (plan.status !== 'draft') {
      return res.status(400).json({ success: false, error: 'Cannot edit a submitted or completed plan.' });
    }

    // Step 2: Build dynamic UPDATE — only update provided fields
    const updates = [];
    const params  = [];

    if (name && name.trim()) {
      params.push(name.trim());
      updates.push(`name = $${params.length}`);
    }
    if (event_type_id !== undefined) {
      params.push(event_type_id || null);
      updates.push(`event_type_id = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide at least one field to update (name, event_type_id).' });
    }

    params.push(planId);
    const sql = `
      UPDATE event_plans
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE event_id = $${params.length}
      RETURNING *
    `;

    const updateRes = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Plan updated.',
      data: { plan: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 9: DELETE /api/event-plans/:id
// Delete a draft plan (CASCADE deletes items via FK ON DELETE CASCADE)
const deleteEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId = parseInt(req.params.id, 10);

    // Step 1: Find plan + verify ownership
    const findRes = await db.query(
      `SELECT event_id, customer_id, status
       FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = findRes.rows[0];

    if (plan.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This plan does not belong to you.' });
    }

    // Step 2: Only draft plans can be deleted
    if (plan.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a submitted or completed plan.',
      });
    }

    // Step 3: Delete — event_plan_items will cascade delete due to ON DELETE CASCADE FK
    await db.query(`DELETE FROM event_plans WHERE event_id = $1`, [planId]);

    return res.status(200).json({
      success: true,
      message: 'Event plan deleted.',
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 10: POST /api/event-plans/:id/items
// Add to Cart — add a service to a draft plan
const addItemToPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId = parseInt(req.params.id, 10);

    const {
      service_id,
      event_date,
      guest_count,
      special_requests,
      quantity = 1,
    } = req.body;

    const qty = parseInt(quantity) || 1;

    // Step 1: Verify plan ownership + must be draft
    const planRes = await db.query(
      `SELECT event_id, customer_id, status
       FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = planRes.rows[0];

    if (plan.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This plan does not belong to you.' });
    }

    if (plan.status !== 'draft') {
      return res.status(400).json({ success: false, error: 'Plan already submitted. Cannot add items.' });
    }

    // Step 2: Verify service exists, is active, vendor approved
    const serviceRes = await db.query(
      `SELECT
         s.service_id, s.title, s.base_price, s.vendor_id,
         COALESCE(vp.company_name, u.full_name) AS vendor_name
       FROM services s
       JOIN vendor_profiles vp ON s.vendor_id = vp.vendor_id
       JOIN users u ON vp.vendor_id = u.user_id
       WHERE s.service_id = $1
         AND s.is_active = true
         AND vp.registration_status = 'approved'`,
      [service_id]
    );

    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not available.', code: 'SERVICE_NOT_FOUND' });
    }

    const service = serviceRes.rows[0];

    // Step 3: Check for duplicate (same service already in this plan, not cancelled)
    const dupeRes = await db.query(
      `SELECT COUNT(*) AS cnt
       FROM event_plan_items
       WHERE event_id = $1
         AND service_id = $2
         AND vendor_item_status != 'cancelled'`,
      [planId, service_id]
    );

    if (parseInt(dupeRes.rows[0].cnt) > 0) {
      return res.status(409).json({
        success: false,
        error: 'This service is already in the plan.',
        code: 'DUPLICATE_ITEM',
      });
    }

    // Step 4: Prevent vendor from booking their own service
    if (service.vendor_id === customerId) {
      return res.status(400).json({ success: false, error: 'You cannot add your own service to a plan.' });
    }

    // Step 5: Insert the item
    const unit_price_at_time = parseFloat(service.base_price);
    const line_total = unit_price_at_time * qty;

    const itemRes = await db.query(
      `INSERT INTO event_plan_items
         (event_id, service_id, event_date, guest_count,
          special_requests, quantity, unit_price_at_time,
          line_total, vendor_item_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        planId,
        service_id,
        event_date,
        guest_count || null,
        special_requests || null,
        qty,
        unit_price_at_time,
        line_total,
      ]
    );

    const newItem = itemRes.rows[0];

    // Update plan's estimated_total_cost
    await db.query(
      `UPDATE event_plans
       SET estimated_total_cost = (
         SELECT COALESCE(SUM(line_total), 0)
         FROM event_plan_items
         WHERE event_id = $1 AND vendor_item_status != 'cancelled'
       ), updated_at = NOW()
       WHERE event_id = $1`,
      [planId]
    );

    // Step 6: Notify vendor (non-blocking)
    const customerRes = await db.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [customerId]
    );
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    await sendNotification({
      userId: service.vendor_id,
      eventId: planId,
      title: 'New Service Request',
      messageBody: `${customerName} added "${service.title}" to their event plan.`,
      notificationType: 'booking_new',
      actionUrl: '/vendor/bookings',
    });

    return res.status(201).json({
      success: true,
      message: 'Service added to plan.',
      data: {
        item: {
          ...newItem,
          service_title: service.title,
          vendor_name: service.vendor_name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 11: DELETE /api/event-plans/:planId/items/:itemId
// Remove an item from a draft plan
const removeItemFromPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId  = parseInt(req.params.planId, 10);
    const itemId  = parseInt(req.params.itemId, 10);

    // Step 1: Verify plan ownership + must be draft
    const planRes = await db.query(
      `SELECT event_id, customer_id, status
       FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = planRes.rows[0];

    if (plan.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This plan does not belong to you.' });
    }

    if (plan.status !== 'draft') {
      return res.status(400).json({ success: false, error: 'Cannot remove items from a submitted plan.' });
    }

    // Step 2: Verify item belongs to this plan
    const itemRes = await db.query(
      `SELECT event_item_id FROM event_plan_items
       WHERE event_item_id = $1 AND event_id = $2`,
      [itemId, planId]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found in this plan.', code: 'ITEM_NOT_FOUND' });
    }

    // Step 3: Delete the item
    await db.query(
      `DELETE FROM event_plan_items WHERE event_item_id = $1`,
      [itemId]
    );

    // Update plan's estimated_total_cost
    await db.query(
      `UPDATE event_plans
       SET estimated_total_cost = (
         SELECT COALESCE(SUM(line_total), 0)
         FROM event_plan_items
         WHERE event_id = $1 AND vendor_item_status != 'cancelled'
       ), updated_at = NOW()
       WHERE event_id = $1`,
      [planId]
    );

    return res.status(200).json({
      success: true,
      message: 'Item removed from plan.',
    });
  } catch (err) {
    next(err);
  }
};

// FUNCTION 12: POST /api/event-plans/:id/submit
// Submit plan — changes draft → submitted and notifies all vendors
const submitEventPlan = async (req, res, next) => {
  try {
    const customerId = req.user.user_id;
    const planId = parseInt(req.params.id, 10);

    // Step 1: Verify plan ownership
    const findRes = await db.query(
      `SELECT * FROM event_plans WHERE event_id = $1`,
      [planId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event plan not found.', code: 'PLAN_NOT_FOUND' });
    }

    const plan = findRes.rows[0];

    if (plan.customer_id !== customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden: This plan does not belong to you.' });
    }

    // Step 2: Check status
    if (plan.status === 'submitted') {
      return res.status(400).json({ success: false, error: 'This plan is already submitted.' });
    }
    if (plan.status !== 'draft') {
      return res.status(400).json({ success: false, error: 'Only draft plans can be submitted.' });
    }

    // Step 3: Ensure at least one non-cancelled item exists
    const countRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM event_plan_items
       WHERE event_id = $1 AND vendor_item_status != 'cancelled'`,
      [planId]
    );

    if (parseInt(countRes.rows[0].cnt) === 0) {
      return res.status(400).json({
        success: false,
        error: 'Add at least one service before submitting the plan.',
      });
    }

    // Step 4: Update plan status to 'submitted'
    const updateRes = await db.query(
      `UPDATE event_plans
       SET status = 'submitted', updated_at = NOW()
       WHERE event_id = $1
       RETURNING *`,
      [planId]
    );

    const updatedPlan = updateRes.rows[0];

    // Step 5: Notify each distinct vendor in this plan (non-blocking)
    try {
      const vendorsRes = await db.query(
        `SELECT DISTINCT s.vendor_id
         FROM event_plan_items epi
         JOIN services s ON epi.service_id = s.service_id
         WHERE epi.event_id = $1 AND epi.vendor_item_status != 'cancelled'`,
        [planId]
      );

      const customerRes = await db.query(
        `SELECT full_name FROM users WHERE user_id = $1`,
        [customerId]
      );
      const customerName = customerRes.rows[0]?.full_name || 'A customer';

      for (const row of vendorsRes.rows) {
        await sendNotification({
          userId: row.vendor_id,
          eventId: planId,
          title: 'New Event Plan Submitted',
          messageBody: `${customerName} submitted an event plan with your services. Please review and respond.`,
          notificationType: 'plan_submitted',
          actionUrl: '/vendor/bookings',
        });
      }
    } catch (notifErr) {
      console.error('[Submit Plan Notify Error]', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Plan submitted successfully. Vendors have been notified.',
      data: { plan: updatedPlan },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDirectBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  createEventPlan,
  getMyEventPlans,
  getEventPlanById,
  updateEventPlan,
  deleteEventPlan,
  addItemToPlan,
  removeItemFromPlan,
  submitEventPlan,
};
