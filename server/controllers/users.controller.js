const db      = require('../db');
const bcrypt  = require('bcryptjs');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE (verified from 001_initial_schema.sql)
//
// users table:
//   cols: user_id, role('customer'|'vendor'|'admin'), username, email,
//         password_hash, full_name, phone, preferred_language,
//         is_active(BOOLEAN), created_at, updated_at
//   NOTE: NO avatar_url on users! It's on customer_profiles.
//
// customer_profiles:
//   PK:  customer_id (= users.user_id)
//   cols: address, city, avatar_url
//
// vendor_profiles:
//   PK:    vendor_id (= users.user_id)
//   cols:  vendor_type, company_name, company_description, address, city,
//          logo_url, preferred_category_id, social_links(JSONB),
//          payment_method, iban, registration_status,
//          pending_changes(JSONB), pending_changes_at, created_at
//   NOTE:  NO bank_name, NO website, NO updated_at, NO bio (it's company_description)
//
// event_plan_items:
//   status col: vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
//   Eligible for count: 'accepted' OR 'completed'
//
// JWT payload: { userId, role } → req.user.userId
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// FUNCTION 1: GET /api/users/me
// Full profile of the logged-in user — all roles
// ---------------------------------------------------------------------------
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role   = req.user.role;

    // Base user query — NO avatar_url on users table
    const userRes = await db.query(
      `SELECT user_id, role, username, email, full_name, phone,
              preferred_language, is_active, created_at, updated_at
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.', code: 'USER_NOT_FOUND' });
    }

    let user = { ...userRes.rows[0] };

    // Always fetch unread notification count
    const unreadRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    user.unread_notifications = parseInt(unreadRes.rows[0].cnt);

    // Role-specific enrichment
    if (role === 'vendor') {
      const vendorRes = await db.query(
        `SELECT
           vp.vendor_id, vp.vendor_type, vp.company_name, vp.company_description,
           vp.address, vp.city, vp.logo_url, vp.preferred_category_id,
           vp.social_links, vp.payment_method, vp.iban,
           vp.registration_status, vp.pending_changes, vp.pending_changes_at,
           vp.approved_at, vp.created_at AS vendor_created_at,
           c.name AS preferred_category_name,
           (SELECT COUNT(*) FROM services s
            WHERE s.vendor_id = $1 AND s.is_active = true) AS active_services_count,
           (SELECT COUNT(*) FROM services s
            WHERE s.vendor_id = $1) AS total_services_count
         FROM vendor_profiles vp
         LEFT JOIN categories c ON vp.preferred_category_id = c.category_id
         WHERE vp.vendor_id = $1`,
        [userId]
      );

      if (vendorRes.rows.length > 0) {
        const vp = vendorRes.rows[0];
        user = {
          ...user,
          ...vp,
          // Mask IBAN — show only last 4 digits
          iban: vp.iban ? `****${vp.iban.slice(-4)}` : null,
          // Expose whether pending changes exist
          has_pending_changes: vp.pending_changes !== null,
        };
      }

    } else if (role === 'customer') {
      // customer_profiles holds avatar_url
      const cpRes = await db.query(
        `SELECT avatar_url, city, address FROM customer_profiles WHERE customer_id = $1`,
        [userId]
      );
      if (cpRes.rows.length > 0) {
        user = { ...user, ...cpRes.rows[0] };
      }

      // Customer booking stats — use vendor_item_status (not 'confirmed')
      const statsRes = await db.query(
        `SELECT
           (SELECT COUNT(*) FROM event_plans ep
            WHERE ep.customer_id = $1) AS total_events,
           (SELECT COUNT(*) FROM event_plan_items epi
            JOIN event_plans ep ON epi.event_id = ep.event_id
            WHERE ep.customer_id = $1
              AND epi.vendor_item_status IN ('accepted', 'completed')) AS total_bookings`,
        [userId]
      );
      user = { ...user, ...statsRes.rows[0] };

    }
    // admin role: return base user data only

    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: PUT /api/users/me
// Update shared profile fields — all authenticated users
// ---------------------------------------------------------------------------
const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role   = req.user.role;

    // Fields updatable on users table
    const usersAllowed = ['full_name', 'phone'];
    const updates = [];
    const params  = [];

    for (const field of usersAllowed) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    }

    let updatedUser = null;

    if (updates.length > 0) {
      params.push(userId);
      const result = await db.query(
        `UPDATE users
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE user_id = $${params.length}
         RETURNING user_id, full_name, email, phone, role, updated_at`,
        params
      );
      updatedUser = result.rows[0];
    } else {
      // Fetch current user if nothing changed on users table
      const current = await db.query(
        `SELECT user_id, full_name, email, phone, role, updated_at FROM users WHERE user_id = $1`,
        [userId]
      );
      updatedUser = current.rows[0];
    }

    // If vendor: also apply instant vendor_profiles updates
    // Instant fields: company_description, social_links, logo_url, city
    // (sensitive fields like company_name, iban → go through /api/vendor/profile)
    if (role === 'vendor') {
      const vpAllowed = ['company_description', 'social_links', 'city'];
      const vpUpdates = [];
      const vpParams  = [];

      for (const field of vpAllowed) {
        if (req.body[field] !== undefined) {
          vpParams.push(req.body[field]);
          vpUpdates.push(`${field} = $${vpParams.length}`);
        }
      }

      if (vpUpdates.length > 0) {
        vpParams.push(userId);
        await db.query(
          `UPDATE vendor_profiles
           SET ${vpUpdates.join(', ')}
           WHERE vendor_id = $${vpParams.length}`,
          vpParams
        );
      }
    }

    // If customer: update customer_profiles (avatar_url is here)
    if (role === 'customer') {
      const cpAllowed = ['avatar_url'];
      const cpUpdates = [];
      const cpParams  = [];

      for (const field of cpAllowed) {
        if (req.body[field] !== undefined) {
          cpParams.push(req.body[field]);
          cpUpdates.push(`${field} = $${cpParams.length}`);
        }
      }

      if (cpUpdates.length > 0) {
        cpParams.push(userId);
        await db.query(
          `UPDATE customer_profiles
           SET ${cpUpdates.join(', ')}
           WHERE customer_id = $${cpParams.length}`,
          cpParams
        );
      }
    }

    if (updates.length === 0 &&
        (role !== 'vendor' || !['company_description', 'social_links', 'city'].some(f => req.body[f] !== undefined)) &&
        (role !== 'customer' || req.body.avatar_url === undefined)) {
      return res.status(400).json({ success: false, error: 'No valid fields provided to update.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 3: PUT /api/users/me/password
// Change password — any authenticated user
// ---------------------------------------------------------------------------
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password, confirm_password } = req.body;

    // Step 1: Validate confirm matches new
    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    // Step 2: Fetch current password hash
    const userRes = await db.query(
      `SELECT password_hash FROM users WHERE user_id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { password_hash } = userRes.rows[0];

    // Step 3: Verify current password
    // Use bcrypt.compare since auth.controller.js uses bcryptjs to hash passwords
    const isMatch = await bcrypt.compare(current_password, password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    // Step 4: Hash and store new password
    const salt       = await bcrypt.genSalt(12);
    const newHash    = await bcrypt.hash(new_password, salt);

    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
      [newHash, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 4: DELETE /api/users/me
// Soft-delete own account — sets is_active = false
// (users table HAS is_active boolean — verified in schema)
// ---------------------------------------------------------------------------
const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role   = req.user.role;

    // Soft delete — never hard-delete to preserve booking history integrity
    // is_active column confirmed present on users table
    await db.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );

    // TODO Phase 3: invalidate all JWT tokens for this user (token blacklisting)

    // If vendor: also deactivate all their services (non-blocking)
    if (role === 'vendor') {
      db.query(
        `UPDATE services SET is_active = false, updated_at = NOW() WHERE vendor_id = $1`,
        [userId]
      ).catch(err => {
        console.error('[DeleteMe] Failed to deactivate vendor services:', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your account has been deactivated. We hope to see you again.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
};
