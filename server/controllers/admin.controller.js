const db = require('../db');

// ===========================================================================
// SCHEMA REFERENCE — verified from 001_initial_schema.sql
// ===========================================================================
//
// users:
//   PK: user_id, cols: role('customer'|'vendor'|'admin'), full_name, email,
//       phone, is_active(BOOLEAN), created_at, updated_at
//   NO is_banned, NO last_login_at, NO avatar_url (avatar is on customer_profiles)
//
// vendor_profiles:
//   PK: vendor_id  ← THIS IS ALSO THE USER FK (same column, PK = user FK)
//   NO user_id column! Use vendor_id to join to users.user_id
//   cols: vendor_type('company'|'freelancer'), company_name, company_description,
//         city, logo_url, preferred_category_id, social_links(JSONB),
//         payment_method('full_online'|'deposit_cash'), iban,
//         registration_status('pending'|'approved'|'rejected')  — NOT verification_status!
//         pending_changes(JSONB), pending_changes_at,
//         pending_changes_approved_at, approved_at, created_at
//   NO bank_name, NO owner_name, NO website, NO updated_at
//
// categories:
//   PK: category_id, cols: name, slug, icon_name (NOT 'icon'!), is_active
//   NO created_at on categories!
//
// subcategories:
//   PK: subcategory_id, FK: category_id, cols: name, slug, is_active, sort_order
//
// services:
//   PK: service_id, vendor FK: vendor_id, FK: category_id, subcategory_id
//   cols: title, base_price, pricing_unit, is_active, city, capacity,
//         avg_rating, review_count, created_at, updated_at
//
// event_plan_items:
//   PK: event_item_id, FK: event_id (to event_plans), FK: service_id
//   status col: vendor_item_status ENUM 'pending','accepted','rejected','completed','cancelled'
//   price col: unit_price_at_time (NOT unit_price!), quantity, line_total, event_date
//
// event_plans:
//   PK: event_id, FK: customer_id
//   status ENUM: 'draft','submitted','confirmed','completed','cancelled'
//
// notifications:
//   PK: notification_id, FK: user_id, event_id
//   cols: title, message_body (NOT message!), notification_type, is_read, action_url, created_at
//
// vendor_documents: PK: document_id, FK: vendor_id, cols: document_type, file_url, uploaded_at
// JWT payload: { userId, role } → req.user.userId
// ===========================================================================

// ---------------------------------------------------------------------------
// HELPER — non-blocking notification
// ---------------------------------------------------------------------------
const sendNotification = async ({ userId, eventId = null, title, messageBody, notificationType, actionUrl }) => {
  try {
    await db.query(
      `INSERT INTO notifications
         (user_id, event_id, title, message_body, notification_type, action_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, eventId, title, messageBody, notificationType, actionUrl]
    );
  } catch (err) {
    console.error('[Admin Notification Error]', err.message);
  }
};

// ===========================================================================
// FUNCTION 1: GET /api/admin/stats
// Platform-wide KPIs for AdminDashboard
// ===========================================================================
const getPlatformStats = async (req, res, next) => {
  try {
    const [usersRes, vendorStatusRes, bookingsRes, revenueRes, servicesRes, recentRes, pendingVendorsRes, monthlyRes] = await Promise.all([

      // QUERY 1 — User counts
      // is_active=false is our "soft ban" — schema has NO is_banned column
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE role = 'customer') AS total_customers,
          COUNT(*) FILTER (WHERE role = 'vendor')   AS total_vendors,
          COUNT(*) FILTER (WHERE role = 'admin')    AS total_admins,
          COUNT(*) FILTER (WHERE is_active = false) AS total_inactive,
          COUNT(*)                                  AS total_users
        FROM users
      `),

      // QUERY 2 — Vendor status counts
      // registration_status ENUM: 'pending','approved','rejected'
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE registration_status = 'approved') AS approved_vendors,
          COUNT(*) FILTER (WHERE registration_status = 'pending')  AS pending_vendors,
          COUNT(*) FILTER (WHERE registration_status = 'rejected') AS rejected_vendors
        FROM vendor_profiles
      `),

      // QUERY 3 — Booking counts from event_plan_items
      // vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
      db.query(`
        SELECT
          COUNT(*) AS total_bookings,
          COUNT(*) FILTER (WHERE vendor_item_status = 'accepted')  AS confirmed_bookings,
          COUNT(*) FILTER (WHERE vendor_item_status = 'pending')   AS pending_bookings,
          COUNT(*) FILTER (WHERE vendor_item_status = 'cancelled') AS cancelled_bookings
        FROM event_plan_items
      `),

      // QUERY 4 — Revenue from event_plan_items
      // Use line_total (pre-calculated) — avoids unit_price_at_time * quantity math
      // Or use unit_price_at_time * quantity for clarity
      db.query(`
        SELECT
          COALESCE(SUM(line_total) FILTER (WHERE vendor_item_status IN ('accepted', 'completed')), 0) AS gross_revenue,
          COALESCE(SUM(line_total * 0.10) FILTER (WHERE vendor_item_status IN ('accepted', 'completed')), 0) AS total_commission
        FROM event_plan_items
      `),

      // QUERY 5 — Services
      db.query(`
        SELECT
          COUNT(*)                              AS total_services,
          COUNT(*) FILTER (WHERE is_active = true) AS active_services
        FROM services
      `),

      // QUERY 6 — Recent registrations (last 8)
      // avatar_url is on customer_profiles, NOT on users table
      // For vendors we show their logo_url from vendor_profiles
      db.query(`
        SELECT
          u.user_id,
          u.full_name AS name,
          u.email,
          u.role,
          u.created_at AS date,
          u.is_active,
          vp.registration_status AS vendor_status,
          COALESCE(cp.avatar_url, vp.logo_url) AS avatar
        FROM users u
        LEFT JOIN vendor_profiles vp  ON u.user_id = vp.vendor_id AND u.role = 'vendor'
        LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id AND u.role = 'customer'
        ORDER BY u.created_at DESC
        LIMIT 8
      `),

      // QUERY 7 — Pending vendor approvals (registration_status = 'pending')
      db.query(`
        SELECT
          vp.vendor_id,
          COALESCE(vp.company_name, u.full_name) AS company,
          vp.vendor_type,
          vp.registration_status AS status,
          vp.created_at AS submitted,
          c.name AS category,
          u.email,
          vp.logo_url AS avatar
        FROM vendor_profiles vp
        JOIN users u ON vp.vendor_id = u.user_id
        LEFT JOIN categories c ON vp.preferred_category_id = c.category_id
        WHERE vp.registration_status = 'pending'
        ORDER BY vp.created_at ASC
      `),

      // QUERY 8 — Monthly registrations (last 6 months)
      // AdminDashboard chart uses { name, users, vendors } fields
      db.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS name,
          COUNT(*) FILTER (WHERE role = 'customer')       AS users,
          COUNT(*) FILTER (WHERE role = 'vendor')         AS vendors
        FROM users
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `),
    ]);

    const u = usersRes.rows[0];
    const vs = vendorStatusRes.rows[0];
    const b = bookingsRes.rows[0];
    const r = revenueRes.rows[0];
    const s = servicesRes.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers:        parseInt(u.total_users),
          totalVendors:      parseInt(u.total_vendors),
          totalCustomers:    parseInt(u.total_customers),
          totalBanned:       parseInt(u.total_inactive),   // is_active=false as proxy for "banned"
          approvedVendors:   parseInt(vs.approved_vendors),
          pendingVendors:    parseInt(vs.pending_vendors),
          rejectedVendors:   parseInt(vs.rejected_vendors),
          totalBookings:     parseInt(b.total_bookings),
          confirmedBookings: parseInt(b.confirmed_bookings),
          pendingBookings:   parseInt(b.pending_bookings),
          grossRevenue:      parseFloat(r.gross_revenue),
          totalCommission:   parseFloat(r.total_commission),
          totalServices:     parseInt(s.total_services),
          activeServices:    parseInt(s.active_services),
        },
        recentRegistrations:  recentRes.rows,
        pendingVendors:        pendingVendorsRes.rows,
        monthlyRegistrations:  monthlyRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 2: GET /api/admin/vendors
// All vendors with filtering + pagination for AdminVendors
// ===========================================================================
const getVendors = async (req, res, next) => {
  try {
    console.log('\n====== ADMIN getVendors ======');
    console.log('req.user:', req.user);
    console.log('req.query:', req.query);

    const statusParam = req.query.status || null;  // 'pending' | 'approved' | 'rejected'
    const search      = req.query.search   || null;
    const category    = req.query.category || null;
    const page        = Math.max(1, parseInt(req.query.page)  || 1);
    const limit       = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
    const offset      = (page - 1) * limit;

    const conditions = [];
    const params     = [];

    // Status filter — registration_status ENUM: 'pending','approved','rejected'
    if (statusParam) {
      params.push(statusParam.toLowerCase());
      conditions.push(`vp.registration_status = $${params.length}`);
    }

    // Search on company_name, users.full_name, email
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(
        vp.company_name ILIKE $${idx}
        OR u.full_name   ILIKE $${idx}
        OR u.email       ILIKE $${idx}
      )`);
    }

    // Category filter
    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        vp.vendor_id,
        vp.vendor_type,
        COALESCE(vp.company_name, u.full_name)  AS companyName,
        vp.company_description                  AS about,
        vp.city,
        vp.registration_status                  AS status,
        vp.pending_changes,
        vp.pending_changes_at,
        vp.iban,
        vp.created_at                           AS registrationDate,
        u.email,
        u.phone,
        u.full_name                             AS ownerName,
        u.is_active,
        vp.logo_url                             AS avatar,
        c.name                                  AS category,
        c.slug                                  AS category_slug,
        (SELECT COUNT(*) FROM services s
         WHERE s.vendor_id = u.user_id)         AS servicesCount,
        (SELECT COUNT(*) FROM event_plan_items epi
         JOIN services s ON epi.service_id = s.service_id
         WHERE s.vendor_id = u.user_id
           AND epi.vendor_item_status IN ('accepted', 'completed')
        )                                       AS confirmedBookings,
        (vp.pending_changes IS NOT NULL)        AS hasPendingChanges,
        COUNT(*) OVER()                         AS total_count
      FROM vendor_profiles vp
      JOIN users u ON vp.vendor_id = u.user_id
      LEFT JOIN categories c ON vp.preferred_category_id = c.category_id
      ${whereClause}
      ORDER BY
        CASE WHEN vp.registration_status = 'pending' THEN 0 ELSE 1 END,
        vp.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(sql, params);

    console.log('getVendors SQL result row count:', result.rowCount);
    console.log('getVendors first row sample:', result.rows[0] ? JSON.stringify(result.rows[0]).substring(0, 200) : 'NO ROWS');
    console.log('==============================\n');

    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const vendors    = result.rows.map(({ total_count, iban, ...row }) => ({
      ...row,
      // Mask IBAN — show only last 4 chars to admin
      ibanMasked: iban ? `•••• •••• •••• ${iban.slice(-4)}` : null,
      iban,
    }));

    // Counts per status (run quick subquery)
    const countsRes = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE registration_status = 'pending')  AS pending,
        COUNT(*) FILTER (WHERE registration_status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE registration_status = 'rejected') AS rejected,
        COUNT(*)                                                  AS total
      FROM vendor_profiles
    `);
    const counts = countsRes.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          total, page, limit, totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        counts: {
          total:    parseInt(counts.total),
          pending:  parseInt(counts.pending),
          approved: parseInt(counts.approved),
          rejected: parseInt(counts.rejected),
        },
      },
    });
  } catch (err) {
    console.error('====== getVendors ERROR ======');
    console.error(err.message);
    console.error(err.stack);
    console.error('==============================');
    next(err);
  }
};

// ===========================================================================
// FUNCTION 3: GET /api/admin/vendors/:id
// Single vendor full detail — :id is vendor_id (= user_id)
// ===========================================================================
const getVendorById = async (req, res, next) => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    const vendorRes = await db.query(`
      SELECT
        vp.vendor_id,
        vp.vendor_type,
        COALESCE(vp.company_name, u.full_name) AS companyName,
        vp.company_description                  AS about,
        vp.city, vp.address,
        vp.registration_status                  AS status,
        vp.pending_changes,
        vp.pending_changes_at,
        vp.pending_changes_approved_at,
        vp.iban,
        vp.payment_method,
        vp.social_links,
        vp.logo_url                             AS avatar,
        vp.preferred_category_id,
        vp.approved_at,
        vp.created_at                           AS registrationDate,
        u.email,
        u.phone,
        u.full_name                             AS ownerName,
        u.is_active,
        c.name                                  AS category,
        c.slug                                  AS category_slug,
        (vp.pending_changes IS NOT NULL)        AS hasPendingChanges,
        (SELECT COUNT(*) FROM services s
         WHERE s.vendor_id = u.user_id)         AS servicesCount,
        (SELECT COUNT(*) FROM event_plan_items epi
         JOIN services s ON epi.service_id = s.service_id
         WHERE s.vendor_id = u.user_id
           AND epi.vendor_item_status IN ('accepted', 'completed')
        )                                       AS confirmedBookings
      FROM vendor_profiles vp
      JOIN users u ON vp.vendor_id = u.user_id
      LEFT JOIN categories c ON vp.preferred_category_id = c.category_id
      WHERE vp.vendor_id = $1
    `, [vendorId]);

    if (vendorRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found.', code: 'VENDOR_NOT_FOUND' });
    }

    const vendor = vendorRes.rows[0];
    // Build pendingData shape that AdminVendors expects
    vendor.pendingData = vendor.pending_changes;
    vendor.ibanMasked  = vendor.iban ? `•••• •••• •••• ${vendor.iban.slice(-4)}` : null;

    // Extract portfolio links from social_links JSONB array
    // social_links is an array of { type, url } objects
    const socialLinks = Array.isArray(vendor.social_links) ? vendor.social_links : [];
    const instagramLink = socialLinks.find(l => l.type === 'instagram');
    const websiteLink   = socialLinks.find(l => l.type === 'website');
    vendor.portfolioInstagram = instagramLink ? instagramLink.url : null;
    vendor.portfolioWebsite   = websiteLink   ? websiteLink.url   : null;

    // Fetch vendor documents (vendor_documents table exists)
    const docsRes = await db.query(`
      SELECT document_id, document_type, file_url, uploaded_at
      FROM vendor_documents
      WHERE vendor_id = $1
      ORDER BY uploaded_at ASC
    `, [vendorId]);

    // Build documents object in the shape AdminVendors expects
    const documents = {};
    docsRes.rows.forEach(doc => {
      const key = doc.document_type; // 'commercial_register', 'national_id_front', 'national_id_back', etc.
      // Convert snake_case to camelCase for frontend compatibility
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      documents[camelKey] = doc.file_url;
    });
    // Determine documentsStatus
    const isApproved = vendor.status === 'approved';
    const isRejected = vendor.status === 'rejected';
    vendor.documentsStatus = isApproved ? 'verified' : isRejected ? 'rejected' : 'submitted';

    // Fetch all services for this vendor
    const servicesRes = await db.query(`
      SELECT
        s.service_id, s.title, s.base_price, s.pricing_unit,
        s.city, s.is_active, s.avg_rating, s.review_count,
        s.created_at,
        c.name AS category_name
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.vendor_id = $1
      ORDER BY s.is_active DESC, s.created_at DESC
    `, [vendorId]);

    // Fetch last 5 booking items for this vendor
    const bookingsRes = await db.query(`
      SELECT
        epi.event_item_id, epi.vendor_item_status, epi.line_total,
        epi.event_date, epi.quantity, epi.unit_price_at_time,
        epi.created_at,
        s.title AS service_title,
        u.full_name AS customer_name
      FROM event_plan_items epi
      JOIN services s ON epi.service_id = s.service_id
      JOIN event_plans ep ON epi.event_id = ep.event_id
      JOIN users u ON ep.customer_id = u.user_id
      WHERE s.vendor_id = $1
      ORDER BY epi.created_at DESC
      LIMIT 5
    `, [vendorId]);

    return res.status(200).json({
      success: true,
      data: {
        vendor,
        documents,
        services:       servicesRes.rows,
        recentBookings: bookingsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 4: PUT /api/admin/vendors/:id/approve
// Approve a pending vendor
// ===========================================================================
const approveVendor = async (req, res, next) => {
  try {
    const vendorId  = parseInt(req.params.id, 10);
    const adminId   = req.user.userId;

    // Step 1: Find vendor
    const findRes = await db.query(
      `SELECT vendor_id, registration_status FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found.', code: 'VENDOR_NOT_FOUND' });
    }

    // Step 2: Check current status
    if (findRes.rows[0].registration_status === 'approved') {
      return res.status(400).json({ success: false, error: 'This vendor is already approved.' });
    }

    // Step 3: Update registration_status
    // vendor_profiles has NO updated_at column
    const updateRes = await db.query(
      `UPDATE vendor_profiles
       SET registration_status = 'approved',
           approved_by_admin_id = $2,
           approved_at = NOW()
       WHERE vendor_id = $1
       RETURNING vendor_id, registration_status`,
      [vendorId, adminId]
    );

    // Step 4: Notify vendor (non-blocking) — use message_body NOT message
    await sendNotification({
      userId:           vendorId,
      title:            'Account Approved 🎉',
      messageBody:      'Congratulations! Your vendor account has been approved. You can now add your services and start receiving bookings.',
      notificationType: 'vendor_approved',
      actionUrl:        '/vendor/services',
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor approved successfully.',
      data: { vendor: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 5: PUT /api/admin/vendors/:id/reject
// Reject a vendor application
// ===========================================================================
const rejectVendor = async (req, res, next) => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    // Step 1: Find vendor
    const findRes = await db.query(
      `SELECT vendor_id, registration_status FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found.', code: 'VENDOR_NOT_FOUND' });
    }

    // Step 2: Update registration_status to 'rejected'
    const updateRes = await db.query(
      `UPDATE vendor_profiles
       SET registration_status = 'rejected'
       WHERE vendor_id = $1
       RETURNING vendor_id, registration_status`,
      [vendorId]
    );

    // Step 3: Notify vendor (non-blocking)
    const message = reason
      ? `Your vendor application has not been approved at this time. Reason: ${reason}`
      : 'Your vendor application has not been approved at this time. Please review our requirements and reapply.';

    await sendNotification({
      userId:           vendorId,
      title:            'Application Not Approved',
      messageBody:      message,
      notificationType: 'vendor_rejected',
      actionUrl:        '/contact',
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor rejected.',
      data: { vendor: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 6: PUT /api/admin/vendors/:id/approve-changes
// Approve vendor's pending profile changes
// ===========================================================================
const approveVendorChanges = async (req, res, next) => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    // Step 1: Fetch vendor + pending_changes
    const findRes = await db.query(
      `SELECT vp.vendor_id, vp.pending_changes, u.full_name, u.email
       FROM vendor_profiles vp
       JOIN users u ON vp.vendor_id = u.user_id
       WHERE vp.vendor_id = $1`,
      [vendorId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found.', code: 'VENDOR_NOT_FOUND' });
    }

    const vendor = findRes.rows[0];

    // Step 2: Check there are pending changes
    if (!vendor.pending_changes) {
      return res.status(400).json({ success: false, error: 'No pending changes to approve.' });
    }

    // Step 3: Apply changes — only safe fields from vendor_profiles
    const changes  = vendor.pending_changes;
    const updates  = [];
    const params   = [];

    // Only allow known safe fields that exist in vendor_profiles
    const allowed = ['company_name', 'company_description', 'city', 'address',
                     'payment_method', 'preferred_category_id', 'iban'];

    for (const [field, value] of Object.entries(changes)) {
      if (allowed.includes(field)) {
        params.push(value);
        updates.push(`${field} = $${params.length}`);
      }
    }

    // Always clear pending changes and mark approved
    updates.push('pending_changes = NULL');
    updates.push('pending_changes_at = NULL');
    updates.push(`pending_changes_approved_at = NOW()`);
    // vendor_profiles has NO updated_at column

    params.push(vendorId);
    const sql = `
      UPDATE vendor_profiles
      SET ${updates.join(', ')}
      WHERE vendor_id = $${params.length}
    `;
    await db.query(sql, params);

    // Step 4: Notify vendor (non-blocking)
    await sendNotification({
      userId:           vendorId,
      title:            'Profile Changes Approved',
      messageBody:      'Your requested profile changes have been reviewed and approved.',
      notificationType: 'profile_changes_approved',
      actionUrl:        '/vendor/profile',
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor profile changes approved.',
      data: { appliedChanges: changes },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 7: GET /api/admin/users
// All users with filtering + pagination for AdminUsers
// ===========================================================================
const getUsers = async (req, res, next) => {
  try {
    console.log('\n====== ADMIN getUsers ======');
    console.log('req.user:', req.user);
    console.log('req.query:', req.query);

    const roleFilter    = req.query.role   || null;   // 'customer' | 'vendor' | 'admin'
    const statusFilter  = req.query.status || null;   // 'active' | 'banned' (maps to is_active)
    const search        = req.query.search || null;
    const page          = Math.max(1, parseInt(req.query.page)  || 1);
    const limit         = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
    const offset        = (page - 1) * limit;

    const conditions = [];
    const params     = [];

    if (roleFilter) {
      params.push(roleFilter.toLowerCase());
      conditions.push(`u.role = $${params.length}`);
    }

    // 'banned' maps to is_active = false, 'active' maps to is_active = true
    if (statusFilter) {
      if (statusFilter.toLowerCase() === 'banned') {
        conditions.push(`u.is_active = false`);
      } else if (statusFilter.toLowerCase() === 'active') {
        conditions.push(`u.is_active = true`);
      }
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        u.user_id,
        u.full_name AS name,
        u.email,
        u.role,
        u.phone,
        u.is_active,
        -- Map is_active to status string that AdminUsers expects
        CASE WHEN u.is_active THEN 'active' ELSE 'banned' END AS status,
        u.created_at AS "joinDate",
        -- No last_login_at column in schema — return null
        NULL::TEXT   AS "lastActive",
        -- Avatar from role-specific profile tables
        COALESCE(cp.avatar_url, vp.logo_url) AS avatar,
        -- City from role-specific profile tables
        COALESCE(cp.city, vp.city) AS city,
        -- Activity counts — vendor_item_status is actual enum in event_plan_items
        CASE WHEN u.role = 'customer'
          THEN (SELECT COUNT(*) FROM event_plans ep WHERE ep.customer_id = u.user_id)
          ELSE NULL
        END AS "bookingsCount",
        CASE WHEN u.role = 'vendor'
          THEN (SELECT COUNT(*) FROM services s WHERE s.vendor_id = u.user_id)
          ELSE NULL
        END AS "servicesCount",
        CASE WHEN u.role = 'vendor'
          THEN vp.registration_status
          ELSE NULL
        END AS vendor_status,
        COUNT(*) OVER() AS total_count
      FROM users u
      LEFT JOIN vendor_profiles vp  ON u.user_id = vp.vendor_id AND u.role = 'vendor'
      LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id AND u.role = 'customer'
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(sql, params);

    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const users      = result.rows.map(({ total_count, ...row }) => row);

    // Counts per group
    const countsRes = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'customer') AS customers,
        COUNT(*) FILTER (WHERE role = 'vendor')   AS vendors,
        COUNT(*) FILTER (WHERE role = 'admin')    AS admins,
        COUNT(*) FILTER (WHERE is_active = false) AS banned,
        COUNT(*)                                  AS total
      FROM users
    `);
    const counts = countsRes.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total, page, limit, totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        counts: {
          total:     parseInt(counts.total),
          customers: parseInt(counts.customers),
          vendors:   parseInt(counts.vendors),
          admins:    parseInt(counts.admins),
          banned:    parseInt(counts.banned),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 8: PUT /api/admin/users/:userId/ban
// Toggle user active/inactive — schema has NO is_banned column, use is_active
// ===========================================================================
const toggleUserBan = async (req, res, next) => {
  try {
    const userId  = parseInt(req.params.userId, 10);
    const adminId = req.user.userId;

    // Cannot ban yourself
    if (userId === adminId) {
      return res.status(403).json({ success: false, error: 'You cannot ban your own account.' });
    }

    // Step 1: Find user
    const findRes = await db.query(
      `SELECT user_id, full_name, role, is_active FROM users WHERE user_id = $1`,
      [userId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.', code: 'USER_NOT_FOUND' });
    }
    const user = findRes.rows[0];

    // Step 2: Cannot ban another admin
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot ban another admin.' });
    }

    // Step 3: Toggle is_active (schema has no is_banned column!)
    const newIsActive = !user.is_active;
    const updateRes = await db.query(
      `UPDATE users
       SET is_active = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING user_id, full_name, is_active,
         CASE WHEN is_active THEN 'active' ELSE 'banned' END AS status`,
      [newIsActive, userId]
    );

    // Step 4: Notify user (non-blocking)
    if (!newIsActive) {
      // Banning
      await sendNotification({
        userId:           userId,
        title:            'Account Suspended',
        messageBody:      'Your account has been suspended by the platform administrator. Please contact support for more information.',
        notificationType: 'account_banned',
        actionUrl:        '/contact',
      });
    } else {
      // Unbanning
      await sendNotification({
        userId:           userId,
        title:            'Account Reinstated',
        messageBody:      'Your account access has been restored. Welcome back!',
        notificationType: 'account_reinstated',
        actionUrl:        '/',
      });
    }

    return res.status(200).json({
      success: true,
      message: newIsActive ? 'User unbanned.' : 'User banned.',
      data: { user: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 9: GET /api/admin/categories
// All categories with subcategories nested
// ===========================================================================
const getCategories = async (req, res, next) => {
  try {
    // categories has: category_id, name, slug, icon_name (NOT 'icon'!), is_active
    // NO created_at on categories table!
    const result = await db.query(`
      SELECT
        c.category_id AS id,
        c.name,
        c.slug,
        c.icon_name   AS icon,
        c.is_active   AS "isActive",
        (SELECT COUNT(*) FROM services s
         WHERE s.category_id = c.category_id) AS "servicesCount",
        COALESCE(
          (SELECT json_agg(
             json_build_object(
               'id',            sc.subcategory_id,
               'name',          sc.name,
               'slug',          sc.slug,
               'isActive',      sc.is_active,
               'servicesCount', (
                 SELECT COUNT(*)
                 FROM services s2
                 WHERE s2.subcategory_id = sc.subcategory_id
               )
             ) ORDER BY sc.sort_order ASC, sc.name ASC
           )
           FROM subcategories sc
           WHERE sc.category_id = c.category_id
          ),
          '[]'::json
        ) AS subcategories
      FROM categories c
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      data: { categories: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 10: POST /api/admin/categories
// Create a new category
// ===========================================================================
const createCategory = async (req, res, next) => {
  try {
    const { name, slug: slugInput, icon, is_active = true } = req.body;

    // Generate slug if not provided
    const slug = (slugInput || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const dupeRes = await db.query(
      `SELECT category_id FROM categories WHERE slug = $1`,
      [slug]
    );
    if (dupeRes.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Category slug already exists.' });
    }

    // icon goes into icon_name column (NOT 'icon'!)
    const insertRes = await db.query(
      `INSERT INTO categories (name, slug, icon_name, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING category_id AS id, name, slug, icon_name AS icon, is_active AS "isActive"`,
      [name, slug, icon, is_active]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      data: { category: { ...insertRes.rows[0], subcategories: [], servicesCount: 0 } },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 11: PUT /api/admin/categories/:id
// Update a category
// ===========================================================================
const updateCategory = async (req, res, next) => {
  try {
    const catId = parseInt(req.params.id, 10);

    // Check category exists
    const findRes = await db.query(
      `SELECT category_id FROM categories WHERE category_id = $1`,
      [catId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    const { name, slug: slugInput, icon, is_active } = req.body;
    const updates = [];
    const params  = [];

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${params.length}`);
    }

    if (slugInput !== undefined) {
      // Check uniqueness excluding self
      const dupeRes = await db.query(
        `SELECT category_id FROM categories WHERE slug = $1 AND category_id != $2`,
        [slugInput, catId]
      );
      if (dupeRes.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'Category slug already exists.' });
      }
      params.push(slugInput);
      updates.push(`slug = $${params.length}`);
    }

    // Icon goes into icon_name column
    if (icon !== undefined) {
      params.push(icon);
      updates.push(`icon_name = $${params.length}`);
    }

    if (is_active !== undefined) {
      params.push(is_active);
      updates.push(`is_active = $${params.length}`);
    }

    // categories table has NO updated_at column — skip it

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update.' });
    }

    params.push(catId);
    const result = await db.query(
      `UPDATE categories SET ${updates.join(', ')}
       WHERE category_id = $${params.length}
       RETURNING category_id AS id, name, slug, icon_name AS icon, is_active AS "isActive"`,
      params
    );

    return res.status(200).json({
      success: true,
      message: 'Category updated.',
      data: { category: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 12: DELETE /api/admin/categories/:id
// Delete a category (only if no active services)
// ===========================================================================
const deleteCategory = async (req, res, next) => {
  try {
    const catId = parseInt(req.params.id, 10);

    // Step 1: Check for active services
    const activeRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM services WHERE category_id = $1 AND is_active = true`,
      [catId]
    );
    if (parseInt(activeRes.rows[0].cnt) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with active services. Deactivate or reassign services first.',
      });
    }

    // Step 2: Delete — subcategories CASCADE due to FK ON DELETE CASCADE in schema
    const result = await db.query(
      `DELETE FROM categories WHERE category_id = $1 RETURNING category_id`,
      [catId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 13: POST /api/admin/categories/:id/subcategories
// Add a subcategory to a category
// ===========================================================================
const createSubcategory = async (req, res, next) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const { name, slug: slugInput, is_active = true } = req.body;

    // Verify parent category exists
    const parentRes = await db.query(
      `SELECT category_id FROM categories WHERE category_id = $1`,
      [catId]
    );
    if (parentRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parent category not found.' });
    }

    // Auto-generate slug if not provided
    const slug = (slugInput || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const insertRes = await db.query(
      `INSERT INTO subcategories (category_id, name, slug, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING subcategory_id AS id, category_id, name, slug, is_active AS "isActive"`,
      [catId, name, slug, is_active]
    );

    return res.status(201).json({
      success: true,
      message: 'Subcategory created.',
      data: { subcategory: { ...insertRes.rows[0], servicesCount: 0 } },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 14: PUT /api/admin/subcategories/:subId
// Update a subcategory
// ===========================================================================
const updateSubcategory = async (req, res, next) => {
  try {
    const subId = parseInt(req.params.subId, 10);

    // Find subcategory
    const findRes = await db.query(
      `SELECT subcategory_id, category_id FROM subcategories WHERE subcategory_id = $1`,
      [subId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Subcategory not found.' });
    }

    const { name, slug: slugInput, is_active } = req.body;
    const updates = [];
    const params  = [];

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${params.length}`);
    }
    if (slugInput !== undefined) {
      params.push(slugInput);
      updates.push(`slug = $${params.length}`);
    }
    if (is_active !== undefined) {
      params.push(is_active);
      updates.push(`is_active = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update.' });
    }

    params.push(subId);
    const result = await db.query(
      `UPDATE subcategories SET ${updates.join(', ')}
       WHERE subcategory_id = $${params.length}
       RETURNING subcategory_id AS id, category_id, name, slug, is_active AS "isActive"`,
      params
    );

    return res.status(200).json({
      success: true,
      message: 'Subcategory updated.',
      data: { subcategory: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 15: DELETE /api/admin/subcategories/:subId
// Delete a subcategory (only if no active services)
// ===========================================================================
const deleteSubcategory = async (req, res, next) => {
  try {
    const subId = parseInt(req.params.subId, 10);

    // Check for active services
    const activeRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM services WHERE subcategory_id = $1 AND is_active = true`,
      [subId]
    );
    if (parseInt(activeRes.rows[0].cnt) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete subcategory with active services. Deactivate or reassign services first.',
      });
    }

    const result = await db.query(
      `DELETE FROM subcategories WHERE subcategory_id = $1 RETURNING subcategory_id`,
      [subId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Subcategory not found.' });
    }

    return res.status(200).json({ success: true, message: 'Subcategory deleted.' });
  } catch (err) {
    next(err);
  }
};

// ===========================================================================
// FUNCTION 16: GET /api/admin/analytics
// Revenue + booking charts for AdminAnalytics page
// AdminAnalytics uses: REVENUE_DATA shape { month, revenue, bookings }
//                      TOP_VENDORS shape { name, category, revenue, growth }
//                      LOCATION_DATA shape { city, bookings }
// ===========================================================================
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [monthlyRes, categoryRevRes, locationRes, topVendorsRes, overallRes] = await Promise.all([

      // QUERY 1 — Monthly revenue + bookings (last 7 months)
      // AdminAnalytics chart dataKey: "month", "revenue", "bookings"
      // Use line_total (pre-calculated) and event_date for bucketing
      db.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', epi.event_date), 'Mon') AS month,
          COUNT(*) FILTER (WHERE epi.vendor_item_status IN ('accepted','completed')) AS bookings,
          COALESCE(SUM(epi.line_total) FILTER (
            WHERE epi.vendor_item_status IN ('accepted','completed')
          ), 0) AS revenue,
          COALESCE(SUM(epi.line_total * 0.10) FILTER (
            WHERE epi.vendor_item_status IN ('accepted','completed')
          ), 0) AS commission
        FROM event_plan_items epi
        WHERE epi.event_date IS NOT NULL
          AND epi.event_date >= NOW() - INTERVAL '7 months'
        GROUP BY DATE_TRUNC('month', epi.event_date)
        ORDER BY DATE_TRUNC('month', epi.event_date) ASC
      `),

      // QUERY 2 — Revenue by category (for category bar chart)
      db.query(`
        SELECT
          c.name,
          c.slug,
          COUNT(epi.event_item_id)                                AS bookings,
          COALESCE(SUM(epi.line_total) FILTER (
            WHERE epi.vendor_item_status IN ('accepted','completed')
          ), 0)                                                   AS revenue
        FROM categories c
        LEFT JOIN services s         ON s.category_id = c.category_id
        LEFT JOIN event_plan_items epi ON epi.service_id = s.service_id
        WHERE c.is_active = true
        GROUP BY c.category_id, c.name, c.slug
        ORDER BY revenue DESC
      `),

      // QUERY 3 — Bookings by location (city)
      // AdminAnalytics uses { city, bookings } shape
      db.query(`
        SELECT
          s.city,
          COUNT(epi.event_item_id) AS bookings
        FROM event_plan_items epi
        JOIN services s ON epi.service_id = s.service_id
        WHERE s.city IS NOT NULL AND s.city != ''
        GROUP BY s.city
        ORDER BY bookings DESC
        LIMIT 6
      `),

      // QUERY 4 — Top vendors by revenue
      // AdminAnalytics TOP_VENDORS shape: { name, category, revenue, growth }
      // growth: no historical data — use avg_rating as proxy metric
      db.query(`
        SELECT
          COALESCE(vp.company_name, u.full_name) AS name,
          c.name                                  AS category,
          COALESCE(SUM(epi.line_total) FILTER (
            WHERE epi.vendor_item_status IN ('accepted','completed')
          ), 0)                                   AS revenue,
          COUNT(epi.event_item_id)                AS bookings,
          ROUND(COALESCE(
            (SELECT AVG(r.rating) FROM reviews r
             JOIN services s2 ON r.service_id = s2.service_id
             WHERE s2.vendor_id = u.user_id),
            0
          )::numeric, 1)                          AS rating
        FROM vendor_profiles vp
        JOIN users u ON vp.vendor_id = u.user_id
        LEFT JOIN services s         ON s.vendor_id = u.user_id
        LEFT JOIN event_plan_items epi ON epi.service_id = s.service_id
        LEFT JOIN categories c       ON vp.preferred_category_id = c.category_id
        WHERE vp.registration_status = 'approved'
        GROUP BY vp.vendor_id, u.user_id, u.full_name, vp.company_name, c.name
        ORDER BY revenue DESC NULLS LAST
        LIMIT 5
      `),

      // QUERY 5 — Overall revenue KPIs
      db.query(`
        SELECT
          COALESCE(SUM(line_total) FILTER (
            WHERE vendor_item_status IN ('accepted','completed')
          ), 0) AS total_revenue,
          COUNT(*) FILTER (
            WHERE vendor_item_status IN ('accepted','completed')
          )     AS total_bookings,
          CASE WHEN COUNT(*) FILTER (WHERE vendor_item_status IN ('accepted','completed')) > 0
            THEN ROUND(
              SUM(line_total) FILTER (WHERE vendor_item_status IN ('accepted','completed')) /
              COUNT(*) FILTER (WHERE vendor_item_status IN ('accepted','completed')),
              2
            )
            ELSE 0
          END AS avg_booking_value
        FROM event_plan_items
      `),
    ]);

    const kpi = overallRes.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        // AdminAnalytics REVENUE_DATA: { month, revenue, bookings }
        monthlyData:     monthlyRes.rows.map(r => ({
          month:      r.month,
          revenue:    parseFloat(r.revenue),
          bookings:   parseInt(r.bookings),
          commission: parseFloat(r.commission),
        })),
        // For AdminDashboard CATEGORY_BOOKINGS: { name, value }
        categoryRevenue: categoryRevRes.rows.map(r => ({
          name:     r.name,
          value:    parseInt(r.bookings),   // count of bookings for dashboard
          revenue:  parseFloat(r.revenue),  // revenue value for analytics
          slug:     r.slug,
        })),
        // AdminAnalytics LOCATION_DATA: { city, bookings }
        locationData:    locationRes.rows.map(r => ({
          city:     r.city,
          bookings: parseInt(r.bookings),
        })),
        // AdminAnalytics TOP_VENDORS: { name, category, revenue, growth }
        topVendors:      topVendorsRes.rows.map(r => ({
          name:     r.name,
          category: r.category || 'General',
          revenue:  parseFloat(r.revenue),
          bookings: parseInt(r.bookings),
          rating:   parseFloat(r.rating),
          growth:   0, // historical comparison not available yet
        })),
        kpis: {
          totalRevenue:    parseFloat(kpi.total_revenue),
          totalBookings:   parseInt(kpi.total_bookings),
          avgBookingValue: parseFloat(kpi.avg_booking_value),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlatformStats,
  getVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  approveVendorChanges,
  getUsers,
  toggleUserBan,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getAdminAnalytics,
};
