const db   = require('../db');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE (verified from 001_initial_schema.sql)
//
// vendor_profiles:
//   PK:              vendor_id  (= users.user_id)
//   vendor FK:       vendor_id  (not user_id — same value, same column)
//   cols:            vendor_type('company'|'freelancer'), company_name,
//                    company_description, address, city, logo_url,
//                    preferred_category_id, social_links(JSONB),
//                    payment_method('full_online'|'deposit_cash'),
//                    iban, registration_status('pending'|'approved'|'rejected'),
//                    pending_changes(JSONB), pending_changes_at,
//                    pending_changes_approved_at, approved_by_admin_id,
//                    approved_at, created_at
//   NOTE: NO bank_name, NO website, NO updated_at columns!
//
// services:
//   PK:              service_id
//   vendor FK:       vendor_id
//   cols:            category_id, subcategory_id, title, description,
//                    base_price, pricing_unit, service_location, city,
//                    capacity, is_active, avg_rating, review_count,
//                    created_at, updated_at
//   NOTE: NO tags column!
//
// service_images:
//   PK:              image_id
//   service FK:      service_id
//   cols:            image_url, is_primary, sort_order (NOT display_order!),
//                    created_at
//
// event_plan_items:
//   PK:              event_item_id
//   plan FK:         event_id
//   service FK:      service_id
//   status col:      vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
//   price:           unit_price_at_time, line_total
//   NOTE: NO payment_method, NO updated_at on items
//
// escrow_transactions:
//   PK:              escrow_id
//   FK to payments:  payment_id
//   FK to items:     event_item_id
//   vendor FK:       vendor_id (direct, not via service)
//   cols:            amount_held, platform_fee, amount_payable,
//                    status('held'|'released'|'refunded'|'disputed')
//
// JWT token payload: { userId, role } → req.user.userId  (NOT req.user.user_id)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// MULTER — disk storage for local uploads
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ---------------------------------------------------------------------------
// HELPER — primary image subquery
// ---------------------------------------------------------------------------
const primaryImageSubquery = (alias = 's') => `(
  SELECT si.image_url
  FROM service_images si
  WHERE si.service_id = ${alias}.service_id
  ORDER BY si.is_primary DESC, si.sort_order ASC
  LIMIT 1
)`;

// ---------------------------------------------------------------------------
// HELPER — non-blocking notification insert
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
    console.error('[Notification Error]', err.message);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 1: GET /api/vendor/services
// Vendor's own services — active AND inactive
// ---------------------------------------------------------------------------
const getMyServices = async (req, res, next) => {
  try {
    // JWT payload uses 'userId' (verified in auth.controller.js line 84)
    const vendorId = req.user.userId;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const params = [vendorId];
    const conditions = ['s.vendor_id = $1'];

    // Optional: is_active filter
    if (req.query.is_active !== undefined) {
      const isActive = req.query.is_active === 'true';
      params.push(isActive);
      conditions.push(`s.is_active = $${params.length}`);
    }

    // Optional: category slug filter
    if (req.query.category && req.query.category.trim()) {
      params.push(req.query.category.trim());
      conditions.push(`c.slug = $${params.length}`);
    }

    // Optional: keyword search
    if (req.query.search && req.query.search.trim()) {
      params.push(`%${req.query.search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(s.title) LIKE $${params.length} OR LOWER(s.description) LIKE $${params.length})`);
    }

    params.push(limit);
    const limitParam  = params.length;
    params.push(offset);
    const offsetParam = params.length;

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Use correlated subqueries — avoids GROUP BY complexity with JOINs
    // vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
    const sql = `
      SELECT
        s.service_id, s.vendor_id, s.category_id, s.subcategory_id,
        s.title, s.description, s.base_price, s.pricing_unit,
        s.service_location, s.city, s.capacity, s.is_active,
        s.avg_rating, s.review_count, s.created_at, s.updated_at,
        ${primaryImageSubquery('s')} AS primary_image_url,
        c.name   AS category_name,
        c.slug   AS category_slug,
        sc.name  AS subcategory_name,
        (SELECT COUNT(*) FROM event_plan_items epi
         WHERE epi.service_id = s.service_id
           AND epi.vendor_item_status != 'cancelled') AS total_bookings,
        (SELECT COUNT(*) FROM event_plan_items epi
         WHERE epi.service_id = s.service_id
           AND epi.vendor_item_status = 'accepted') AS confirmed_bookings,
        COUNT(*) OVER() AS total_count
      FROM services s
      LEFT JOIN categories   c  ON s.category_id    = c.category_id
      LEFT JOIN subcategories sc ON s.subcategory_id = sc.subcategory_id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await db.query(sql, params);

    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const services   = result.rows.map(({ total_count, ...row }) => row);

    return res.status(200).json({
      success: true,
      data: {
        services,
        pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: POST /api/vendor/services
// Create a new service
// ---------------------------------------------------------------------------
const createService = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    const {
      title, description, base_price, pricing_unit,
      category_id, subcategory_id, city, capacity, service_location,
    } = req.body;

    // Step 1: Verify vendor is approved
    const vendorRes = await db.query(
      `SELECT registration_status FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );

    if (vendorRes.rows.length === 0 || vendorRes.rows[0].registration_status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Your account must be approved before adding services.',
        code: 'VENDOR_NOT_APPROVED',
      });
    }

    // Step 2: Verify category exists and is active
    const catRes = await db.query(
      `SELECT category_id FROM categories WHERE category_id = $1 AND is_active = true`,
      [category_id]
    );
    if (catRes.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or inactive category.' });
    }

    // Step 3: If subcategory_id provided, verify it belongs to this category
    if (subcategory_id) {
      const subRes = await db.query(
        `SELECT subcategory_id FROM subcategories WHERE subcategory_id = $1 AND category_id = $2`,
        [subcategory_id, category_id]
      );
      if (subRes.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid subcategory for this category.' });
      }
    }

    // Step 4: INSERT service
    // NOTE: schema has NO tags column. Skipping it.
    const result = await db.query(
      `INSERT INTO services
         (vendor_id, category_id, subcategory_id, title, description,
          base_price, pricing_unit, service_location, city, capacity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [
        vendorId,
        category_id,
        subcategory_id || null,
        title,
        description,
        parseFloat(base_price),
        pricing_unit,
        service_location || null,
        city,
        capacity ? parseInt(capacity) : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: { service: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 3: PATCH /api/vendor/services/:id
// Update an existing service (dynamic update — only provided fields)
// ---------------------------------------------------------------------------
const updateService = async (req, res, next) => {
  try {
    const vendorId  = req.user.userId;
    const serviceId = parseInt(req.params.id, 10);

    // Step 1: Verify ownership
    const findRes = await db.query(
      `SELECT * FROM services WHERE service_id = $1 AND vendor_id = $2`,
      [serviceId, vendorId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }

    const existing = findRes.rows[0];

    // Step 2: If category_id is being changed, validate it
    const newCategoryId = req.body.category_id !== undefined ? req.body.category_id : existing.category_id;
    if (req.body.category_id !== undefined) {
      const catRes = await db.query(
        `SELECT category_id FROM categories WHERE category_id = $1 AND is_active = true`,
        [req.body.category_id]
      );
      if (catRes.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid or inactive category.' });
      }
    }

    // Step 3: If subcategory_id is being changed, validate against (new or existing) category
    if (req.body.subcategory_id !== undefined && req.body.subcategory_id !== null) {
      const subRes = await db.query(
        `SELECT subcategory_id FROM subcategories WHERE subcategory_id = $1 AND category_id = $2`,
        [req.body.subcategory_id, newCategoryId]
      );
      if (subRes.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid subcategory for this category.' });
      }
    }

    // Step 4: Build dynamic UPDATE — only provided fields
    // NOTE: schema has NO tags column
    const allowed = ['title', 'description', 'base_price', 'pricing_unit',
                     'category_id', 'subcategory_id', 'service_location', 'city', 'capacity'];
    const updates = [];
    const params  = [];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided to update.' });
    }

    params.push(serviceId);
    const sql = `
      UPDATE services
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE service_id = $${params.length}
      RETURNING *
    `;

    const result = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Service updated.',
      data: { service: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 4: PATCH /api/vendor/services/:id/status
// Toggle service active/inactive
// ---------------------------------------------------------------------------
const toggleServiceStatus = async (req, res, next) => {
  try {
    const vendorId  = req.user.userId;
    const serviceId = parseInt(req.params.id, 10);

    const { is_active } = req.body;

    if (is_active === undefined || typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_active must be a boolean.' });
    }

    const result = await db.query(
      `UPDATE services
       SET is_active = $1, updated_at = NOW()
       WHERE service_id = $2 AND vendor_id = $3
       RETURNING service_id, title, is_active`,
      [is_active, serviceId, vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }

    return res.status(200).json({
      success: true,
      message: `Service ${is_active ? 'activated' : 'deactivated'}.`,
      data: { service: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 5: POST /api/vendor/services/:id/images
// Upload 1–8 images for a service (multer applied in route)
// ---------------------------------------------------------------------------
const uploadServiceImages = async (req, res, next) => {
  try {
    const vendorId  = req.user.userId;
    const serviceId = parseInt(req.params.id, 10);

    // Step 1: Verify ownership
    const findRes = await db.query(
      `SELECT service_id FROM services WHERE service_id = $1 AND vendor_id = $2`,
      [serviceId, vendorId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }

    // Step 2: Check files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No images uploaded.' });
    }

    // Step 3: Check current image count against max 8
    const countRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM service_images WHERE service_id = $1`,
      [serviceId]
    );
    const currentCount = parseInt(countRes.rows[0].cnt);

    if (currentCount + req.files.length > 8) {
      // Clean up uploaded files since we can't use them
      req.files.forEach(file => fs.unlink(file.path, () => {}));
      return res.status(400).json({
        success: false,
        error: `Maximum 8 images per service. You have ${currentCount}, tried to add ${req.files.length}.`,
      });
    }

    // Step 4 & 5: INSERT all uploaded files
    const insertedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file      = req.files[i];
      const imageUrl  = `/uploads/${file.filename}`;
      // First ever image becomes primary
      const isPrimary = currentCount === 0 && i === 0;
      const sortOrder = currentCount + i;

      const imgRes = await db.query(
        `INSERT INTO service_images (service_id, image_url, is_primary, sort_order)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [serviceId, imageUrl, isPrimary, sortOrder]
      );
      insertedImages.push(imgRes.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: `${insertedImages.length} image(s) uploaded.`,
      data: { images: insertedImages },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 6: DELETE /api/vendor/services/:id/images/:imageId
// Delete a specific service image
// ---------------------------------------------------------------------------
const deleteServiceImage = async (req, res, next) => {
  try {
    const vendorId  = req.user.userId;
    const serviceId = parseInt(req.params.id, 10);
    const imageId   = parseInt(req.params.imageId, 10);

    // Step 1: Verify service ownership
    const svcRes = await db.query(
      `SELECT service_id FROM services WHERE service_id = $1 AND vendor_id = $2`,
      [serviceId, vendorId]
    );
    if (svcRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }

    // Step 2: Find the image, verify it belongs to this service
    const imgRes = await db.query(
      `SELECT * FROM service_images WHERE image_id = $1 AND service_id = $2`,
      [imageId, serviceId]
    );
    if (imgRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Image not found.', code: 'IMAGE_NOT_FOUND' });
    }

    const image = imgRes.rows[0];

    // Step 3: Delete from DB
    await db.query(`DELETE FROM service_images WHERE image_id = $1`, [imageId]);

    // Step 4: Delete physical file (non-blocking)
    const filename = path.basename(image.image_url);
    const filepath = path.join(uploadsDir, filename);
    fs.unlink(filepath, (err) => {
      if (err) console.error('[File Delete Error]', err.message);
    });

    // Step 5: If deleted image was primary, promote next remaining image
    // PostgreSQL does NOT support ORDER BY / LIMIT in UPDATE directly.
    // Must use a subquery to find the next image_id first.
    if (image.is_primary) {
      await db.query(
        `UPDATE service_images SET is_primary = true
         WHERE image_id = (
           SELECT image_id FROM service_images
           WHERE service_id = $1
           ORDER BY sort_order ASC LIMIT 1
         )`,
        [serviceId]
      );
    }

    return res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 7: GET /api/vendor/bookings
// All booking items for this vendor's services — pending first
// ---------------------------------------------------------------------------
const getMyBookingRequests = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    const { status } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
    const offset = (page - 1) * limit;

    // vendor_item_status ENUM values (from schema):
    // 'pending','accepted','rejected','completed','cancelled'
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowedStatuses.join(', ')}.`,
      });
    }

    const params = [vendorId];
    let statusClause = '';
    if (status) {
      params.push(status);
      statusClause = `AND epi.vendor_item_status = $${params.length}`;
    }

    params.push(limit);
    const limitParam  = params.length;
    params.push(offset);
    const offsetParam = params.length;

    // Main listing — pending items sorted first
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
        s.service_id,
        s.title                  AS service_title,
        s.city                   AS service_city,
        ${primaryImageSubquery('s')} AS service_image,
        ep.event_id              AS plan_id,
        ep.name                  AS plan_name,
        u.user_id                AS customer_id,
        u.full_name              AS customer_name,
        u.email                  AS customer_email,
        u.phone                  AS customer_phone,
        COUNT(*) OVER()          AS total_count
      FROM event_plan_items epi
      JOIN services s      ON epi.service_id = s.service_id
      JOIN event_plans ep  ON epi.event_id   = ep.event_id
      JOIN users u         ON ep.customer_id = u.user_id
      WHERE s.vendor_id = $1
        ${statusClause}
      ORDER BY
        CASE WHEN epi.vendor_item_status = 'pending' THEN 0 ELSE 1 END,
        epi.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    // Summary counts — separate query grouped by status for this vendor
    const summaryRes = await db.query(
      `SELECT
         epi.vendor_item_status AS status,
         COUNT(*) AS cnt
       FROM event_plan_items epi
       JOIN services s ON epi.service_id = s.service_id
       WHERE s.vendor_id = $1
       GROUP BY epi.vendor_item_status`,
      [vendorId]
    );

    const summary = { pending: 0, accepted: 0, rejected: 0, completed: 0, cancelled: 0 };
    summaryRes.rows.forEach(row => {
      if (summary.hasOwnProperty(row.status)) {
        summary[row.status] = parseInt(row.cnt);
      }
    });

    const result = await db.query(sql, params);

    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const bookings   = result.rows.map(({ total_count, ...row }) => row);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        summary,
        pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 8: PATCH /api/vendor/bookings/:itemId/accept
// Vendor accepts a booking request
// ---------------------------------------------------------------------------
const acceptBooking = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const itemId   = parseInt(req.params.itemId, 10);

    // Step 1: Find item + verify it belongs to vendor's service
    const findRes = await db.query(
      `SELECT epi.event_item_id, epi.vendor_item_status, epi.event_id,
              s.title AS service_title,
              ep.customer_id,
              COALESCE(vp.company_name, u.full_name) AS vendor_name
       FROM event_plan_items epi
       JOIN services s      ON epi.service_id = s.service_id
       JOIN event_plans ep  ON epi.event_id   = ep.event_id
       JOIN vendor_profiles vp ON s.vendor_id = vp.vendor_id
       JOIN users u            ON vp.vendor_id = u.user_id
       WHERE epi.event_item_id = $1 AND s.vendor_id = $2`,
      [itemId, vendorId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
    }

    const booking = findRes.rows[0];

    // Step 2: Check status — only 'pending' can be accepted
    if (booking.vendor_item_status === 'accepted') {
      return res.status(400).json({ success: false, error: 'Booking is already confirmed.' });
    }
    if (booking.vendor_item_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking was cancelled by the customer.' });
    }
    if (booking.vendor_item_status === 'rejected') {
      return res.status(400).json({ success: false, error: 'Booking was already rejected.' });
    }
    if (booking.vendor_item_status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending bookings can be accepted.' });
    }

    // Step 3: UPDATE status to 'accepted'
    // NOTE: event_plan_items has NO updated_at column in schema
    const updateRes = await db.query(
      `UPDATE event_plan_items
       SET vendor_item_status = 'accepted'
       WHERE event_item_id = $1
       RETURNING *`,
      [itemId]
    );

    // Step 4: Notify customer (non-blocking)
    await sendNotification({
      userId: booking.customer_id,
      eventId: booking.event_id,
      title: 'Booking Confirmed',
      messageBody: `${booking.vendor_name} confirmed your booking for "${booking.service_title}".`,
      notificationType: 'booking_confirmed',
      actionUrl: '/customer/bookings',
    });

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed.',
      data: { booking: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 9: PATCH /api/vendor/bookings/:itemId/reject
// Vendor rejects a booking request
// ---------------------------------------------------------------------------
const rejectBooking = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const itemId   = parseInt(req.params.itemId, 10);
    const { reason } = req.body;

    // Step 1: Find item + verify it belongs to vendor's service
    const findRes = await db.query(
      `SELECT epi.event_item_id, epi.vendor_item_status, epi.event_id,
              s.title AS service_title,
              ep.customer_id,
              COALESCE(vp.company_name, u.full_name) AS vendor_name
       FROM event_plan_items epi
       JOIN services s      ON epi.service_id = s.service_id
       JOIN event_plans ep  ON epi.event_id   = ep.event_id
       JOIN vendor_profiles vp ON s.vendor_id = vp.vendor_id
       JOIN users u            ON vp.vendor_id = u.user_id
       WHERE epi.event_item_id = $1 AND s.vendor_id = $2`,
      [itemId, vendorId]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
    }

    const booking = findRes.rows[0];

    // Step 2: Check status — only 'pending' can be rejected
    if (booking.vendor_item_status === 'rejected') {
      return res.status(400).json({ success: false, error: 'Booking was already rejected.' });
    }
    if (booking.vendor_item_status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking was cancelled by the customer.' });
    }
    if (booking.vendor_item_status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending bookings can be rejected.' });
    }

    // Step 3: UPDATE status to 'rejected', store vendor_note if reason provided
    // NOTE: event_plan_items has NO updated_at column
    const updateRes = await db.query(
      `UPDATE event_plan_items
       SET vendor_item_status = 'rejected',
           vendor_note = $1
       WHERE event_item_id = $2
       RETURNING *`,
      [reason || null, itemId]
    );

    // Step 4: Notify customer (non-blocking)
    const messageBody = reason
      ? `${booking.vendor_name} rejected your booking for "${booking.service_title}". Reason: ${reason}`
      : `${booking.vendor_name} rejected your booking for "${booking.service_title}".`;

    await sendNotification({
      userId: booking.customer_id,
      eventId: booking.event_id,
      title: 'Booking Rejected',
      messageBody,
      notificationType: 'booking_rejected',
      actionUrl: '/customer/bookings',
    });

    return res.status(200).json({
      success: true,
      message: 'Booking rejected.',
      data: { booking: updateRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 10: GET /api/vendor/profile
// Full authenticated vendor profile with stats
// ---------------------------------------------------------------------------
const getVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Main profile query — uses correlated subqueries for stats
    // vendor_profiles has NO updated_at, NO bank_name, NO website cols
    const profileRes = await db.query(
      `SELECT
         u.user_id, u.email, u.full_name, u.phone,
         u.created_at AS member_since,
         vp.vendor_id, vp.vendor_type, vp.company_name, vp.company_description,
         vp.address, vp.city, vp.logo_url, vp.preferred_category_id,
         vp.social_links, vp.payment_method, vp.iban,
         vp.registration_status, vp.pending_changes, vp.pending_changes_at,
         vp.pending_changes_approved_at, vp.approved_at, vp.created_at,
         c.name AS preferred_category_name,
         c.slug AS preferred_category_slug,
         (SELECT COUNT(*) FROM services s
          WHERE s.vendor_id = u.user_id AND s.is_active = true) AS active_services_count,
         (SELECT COUNT(*) FROM services s
          WHERE s.vendor_id = u.user_id) AS total_services_count,
         (SELECT COUNT(*) FROM event_plan_items epi
          JOIN services s ON epi.service_id = s.service_id
          WHERE s.vendor_id = u.user_id
            AND epi.vendor_item_status = 'accepted') AS total_confirmed_bookings,
         (SELECT COUNT(*) FROM event_plan_items epi
          JOIN services s ON epi.service_id = s.service_id
          WHERE s.vendor_id = u.user_id
            AND epi.vendor_item_status = 'pending') AS pending_bookings_count,
         ROUND(COALESCE(
           (SELECT AVG(r.rating)
            FROM reviews r
            JOIN services s ON r.service_id = s.service_id
            WHERE s.vendor_id = u.user_id), 0
         )::numeric, 1) AS overall_rating
       FROM users u
       JOIN vendor_profiles vp ON u.user_id = vp.vendor_id
       LEFT JOIN categories c  ON vp.preferred_category_id = c.category_id
       WHERE u.user_id = $1`,
      [vendorId]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found.', code: 'PROFILE_NOT_FOUND' });
    }

    // Fetch vendor documents
    const docsRes = await db.query(
      `SELECT document_id, document_type, file_url, uploaded_at
       FROM vendor_documents WHERE vendor_id = $1 ORDER BY uploaded_at DESC`,
      [vendorId]
    );

    const profile = {
      ...profileRes.rows[0],
      documents: docsRes.rows,
      // Mask IBAN for security (show only last 4)
      iban: profileRes.rows[0].iban
        ? `****${profileRes.rows[0].iban.slice(-4)}`
        : null,
    };

    return res.status(200).json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 11: PATCH /api/vendor/profile
// Update profile — instant fields vs pending approval fields
// ---------------------------------------------------------------------------
const updateVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // GROUP A — instant update (no approval needed)
    // vendor_profiles cols: company_description, social_links, logo_url, city, payment_method
    // users cols: phone, full_name
    // NOTE: No website or bank_name columns exist in schema
    const GROUP_A_VENDOR = ['company_description', 'social_links', 'logo_url', 'city'];
    const GROUP_A_USERS  = ['phone'];

    // GROUP B — requires admin approval
    // Must go into pending_changes JSONB
    const GROUP_B = ['company_name', 'iban', 'preferred_category_id'];

    const instantVendorUpdates = {};
    const instantUserUpdates   = {};
    const pendingUpdates       = {};

    // Separate fields
    for (const field of GROUP_A_VENDOR) {
      if (req.body[field] !== undefined) instantVendorUpdates[field] = req.body[field];
    }
    for (const field of GROUP_A_USERS) {
      if (req.body[field] !== undefined) instantUserUpdates[field] = req.body[field];
    }
    for (const field of GROUP_B) {
      if (req.body[field] !== undefined) pendingUpdates[field] = req.body[field];
    }

    const hasInstant = Object.keys(instantVendorUpdates).length > 0 || Object.keys(instantUserUpdates).length > 0;
    const hasPending = Object.keys(pendingUpdates).length > 0;

    if (!hasInstant && !hasPending) {
      return res.status(400).json({ success: false, error: 'No valid fields provided to update.' });
    }

    let appliedInstant = {};
    let appliedPending = null;

    // Step A: Apply instant vendor_profiles updates
    if (Object.keys(instantVendorUpdates).length > 0) {
      const updates = [];
      const params  = [];
      for (const [field, val] of Object.entries(instantVendorUpdates)) {
        params.push(val);
        updates.push(`${field} = $${params.length}`);
      }
      params.push(vendorId);
      await db.query(
        `UPDATE vendor_profiles SET ${updates.join(', ')} WHERE vendor_id = $${params.length}`,
        params
      );
      appliedInstant = { ...appliedInstant, ...instantVendorUpdates };
    }

    // Step A2: Apply instant users updates (phone)
    if (Object.keys(instantUserUpdates).length > 0) {
      const updates = [];
      const params  = [];
      for (const [field, val] of Object.entries(instantUserUpdates)) {
        params.push(val);
        updates.push(`${field} = $${params.length}`);
      }
      params.push(vendorId);
      await db.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = $${params.length}`,
        params
      );
      appliedInstant = { ...appliedInstant, ...instantUserUpdates };
    }

    // Step B: Group B fields → pending_changes JSONB
    if (hasPending) {
      // Check for existing pending_changes
      const currentRes = await db.query(
        `SELECT pending_changes FROM vendor_profiles WHERE vendor_id = $1`,
        [vendorId]
      );
      if (currentRes.rows[0]?.pending_changes !== null) {
        return res.status(409).json({
          success: false,
          error: 'You already have a pending change request. Wait for admin review before submitting new changes.',
          code: 'PENDING_CHANGES_EXIST',
        });
      }

      await db.query(
        `UPDATE vendor_profiles
         SET pending_changes = $1::jsonb,
             pending_changes_at = NOW()
         WHERE vendor_id = $2`,
        [JSON.stringify(pendingUpdates), vendorId]
      );
      appliedPending = pendingUpdates;

      // Notify admins (non-blocking)
      try {
        const adminsRes = await db.query(
          `SELECT user_id FROM users WHERE role = 'admin'`
        );
        for (const admin of adminsRes.rows) {
          await sendNotification({
            userId: admin.user_id,
            title: 'Vendor Profile Change Request',
            messageBody: `Vendor ID ${vendorId} submitted a profile change request requiring review.`,
            notificationType: 'profile_change_request',
            actionUrl: `/admin/vendors/${vendorId}`,
          });
        }
      } catch (notifErr) {
        console.error('[Admin Notify Error]', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated. Sensitive changes are pending admin review.',
      data: {
        instantUpdates: appliedInstant,
        pendingChanges: appliedPending,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 12: POST /api/vendor/profile/logo
// Upload vendor logo — stored in vendor_profiles.logo_url
// ---------------------------------------------------------------------------
const uploadVendorLogo = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Step 1: Check file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded.' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    // Step 2: Get current logo to delete old file
    const currentRes = await db.query(
      `SELECT logo_url FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );
    const oldLogoUrl = currentRes.rows[0]?.logo_url;

    // Step 3: Update vendor_profiles.logo_url (logo is on vendor_profiles, not users)
    await db.query(
      `UPDATE vendor_profiles SET logo_url = $1 WHERE vendor_id = $2`,
      [logoUrl, vendorId]
    );

    // Step 4: Delete old logo file (non-blocking)
    if (oldLogoUrl && oldLogoUrl.startsWith('/uploads/')) {
      const oldFilename = path.basename(oldLogoUrl);
      const oldFilepath = path.join(uploadsDir, oldFilename);
      fs.unlink(oldFilepath, (err) => {
        if (err) console.error('[Logo Delete Error]', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logo updated.',
      data: { logo_url: logoUrl },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 13: GET /api/vendor/analytics
// Monthly bookings + revenue KPI stats
// ---------------------------------------------------------------------------
const getVendorAnalytics = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Run all queries in parallel for performance
    const [kpiRes, monthlyRes, ratingsRes, topServicesRes] = await Promise.all([

      // QUERY 1 — KPI totals
      // vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
      db.query(
        `SELECT
           COUNT(*)                                           AS total_bookings,
           COUNT(CASE WHEN epi.vendor_item_status = 'accepted'  THEN 1 END) AS confirmed_bookings,
           COUNT(CASE WHEN epi.vendor_item_status = 'pending'   THEN 1 END) AS pending_bookings,
           COUNT(CASE WHEN epi.vendor_item_status = 'rejected'  THEN 1 END) AS rejected_bookings,
           COALESCE(SUM(CASE WHEN epi.vendor_item_status = 'accepted'
                             THEN epi.unit_price_at_time * epi.quantity ELSE 0 END), 0) AS total_revenue,
           ROUND(
             COUNT(CASE WHEN epi.vendor_item_status = 'accepted' THEN 1 END)::numeric
             / NULLIF(COUNT(*), 0) * 100, 1
           ) AS acceptance_rate
         FROM event_plan_items epi
         JOIN services s ON epi.service_id = s.service_id
         WHERE s.vendor_id = $1`,
        [vendorId]
      ),

      // QUERY 2 — Monthly bookings + revenue (last 6 months)
      db.query(
        `SELECT
           TO_CHAR(epi.event_date, 'Mon YYYY')       AS month_label,
           EXTRACT(MONTH FROM epi.event_date)::int   AS month_num,
           EXTRACT(YEAR  FROM epi.event_date)::int   AS year,
           COUNT(*)                                  AS bookings_count,
           COALESCE(SUM(epi.unit_price_at_time * epi.quantity), 0) AS revenue,
           COUNT(CASE WHEN epi.vendor_item_status = 'accepted' THEN 1 END) AS confirmed_count
         FROM event_plan_items epi
         JOIN services s ON epi.service_id = s.service_id
         WHERE s.vendor_id = $1
           AND epi.vendor_item_status != 'cancelled'
           AND epi.event_date >= NOW() - INTERVAL '6 months'
         GROUP BY month_label, month_num, year
         ORDER BY year ASC, month_num ASC`,
        [vendorId]
      ),

      // QUERY 3 — Average rating
      db.query(
        `SELECT
           ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1) AS avg_rating,
           COUNT(r.review_id)::int                        AS total_reviews
         FROM reviews r
         JOIN services s ON r.service_id = s.service_id
         WHERE s.vendor_id = $1`,
        [vendorId]
      ),

      // QUERY 4 — Top 5 performing services by confirmed revenue
      db.query(
        `SELECT
           s.service_id,
           s.title,
           COUNT(epi.event_item_id)                                            AS bookings,
           COALESCE(SUM(epi.unit_price_at_time * epi.quantity), 0)             AS revenue,
           ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1)                       AS rating
         FROM services s
         LEFT JOIN event_plan_items epi
           ON s.service_id = epi.service_id AND epi.vendor_item_status = 'accepted'
         LEFT JOIN reviews r ON s.service_id = r.service_id
         WHERE s.vendor_id = $1
         GROUP BY s.service_id, s.title
         ORDER BY revenue DESC NULLS LAST
         LIMIT 5`,
        [vendorId]
      ),
    ]);

    const kpi = kpiRes.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_bookings:      parseInt(kpi.total_bookings),
          confirmed_bookings:  parseInt(kpi.confirmed_bookings),
          pending_bookings:    parseInt(kpi.pending_bookings),
          rejected_bookings:   parseInt(kpi.rejected_bookings),
          total_revenue:       parseFloat(kpi.total_revenue),
          acceptance_rate:     parseFloat(kpi.acceptance_rate) || 0,
          avg_rating:          parseFloat(ratingsRes.rows[0].avg_rating),
          total_reviews:       ratingsRes.rows[0].total_reviews,
        },
        monthlyData: monthlyRes.rows,
        topServices: topServicesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 14: GET /api/vendors/me/payment
// Escrow balance and IBAN info (masked)
// ---------------------------------------------------------------------------
const getPaymentInfo = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // vendor_profiles: iban, pending_changes (for IBAN change detection)
    // NOTE: no bank_name column in schema
    const profileRes = await db.query(
      `SELECT iban, pending_changes FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found.' });
    }

    const { iban, pending_changes } = profileRes.rows[0];

    // escrow_transactions: linked via event_item_id → event_plan_items → services → vendor_id
    // status ENUM: 'held','released','refunded','disputed'
    const escrowRes = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN et.status = 'held'     THEN et.amount_held ELSE 0 END), 0) AS escrow_balance,
         COALESCE(SUM(CASE WHEN et.status = 'released' THEN et.amount_payable ELSE 0 END), 0) AS pending_payout
       FROM escrow_transactions et
       WHERE et.vendor_id = $1`,
      [vendorId]
    );

    const escrow = escrowRes.rows[0];

    // Check if there's a pending IBAN change in pending_changes JSONB
    const hasPendingIbanChange = !!(pending_changes && pending_changes.iban);

    // Mask IBAN — show only last 4 digits
    const maskedIban = iban ? `****${iban.slice(-4)}` : null;

    return res.status(200).json({
      success: true,
      data: {
        iban:                  maskedIban,
        escrow_balance:        parseFloat(escrow.escrow_balance),
        pending_payout:        parseFloat(escrow.pending_payout),
        has_pending_iban_change: hasPendingIbanChange,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 15: POST /api/vendors/me/payment/change-request
// Request IBAN change — goes to pending_changes JSONB for admin review
// ---------------------------------------------------------------------------
const requestPaymentChange = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { new_iban, new_bank_name } = req.body;

    // Step 1: Check for existing pending_changes
    const currentRes = await db.query(
      `SELECT pending_changes FROM vendor_profiles WHERE vendor_id = $1`,
      [vendorId]
    );

    if (currentRes.rows[0]?.pending_changes !== null) {
      return res.status(409).json({
        success: false,
        error: 'You already have a pending change request.',
        code: 'PENDING_CHANGES_EXIST',
      });
    }

    // Step 2: Write to pending_changes JSONB
    // NOTE: no bank_name column in vendor_profiles — store it in the JSONB object only
    await db.query(
      `UPDATE vendor_profiles
       SET pending_changes = jsonb_build_object(
         'iban',          $1::text,
         'bank_name',     $2::text,
         'requested_at',  NOW()::text
       ),
       pending_changes_at = NOW()
       WHERE vendor_id = $3`,
      [new_iban, new_bank_name, vendorId]
    );

    // Step 3: Notify admins (non-blocking)
    try {
      const adminsRes = await db.query(`SELECT user_id FROM users WHERE role = 'admin'`);
      for (const admin of adminsRes.rows) {
        await sendNotification({
          userId: admin.user_id,
          title: 'IBAN Change Request',
          messageBody: `Vendor ID ${vendorId} requested an IBAN change. Please review.`,
          notificationType: 'iban_change_request',
          actionUrl: `/admin/vendors/${vendorId}`,
        });
      }
    } catch (notifErr) {
      console.error('[Admin Notify Error]', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment change request submitted. Admin will review within 24-48 hours.',
      data: { requested: { new_iban: `****${new_iban.slice(-4)}`, new_bank_name } },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  // Service management
  getMyServices,
  createService,
  updateService,
  toggleServiceStatus,
  uploadServiceImages,
  deleteServiceImage,
  // Booking management
  getMyBookingRequests,
  acceptBooking,
  rejectBooking,
  // Profile management
  getVendorProfile,
  updateVendorProfile,
  uploadVendorLogo,
  // Analytics & payment
  getVendorAnalytics,
  getPaymentInfo,
  requestPaymentChange,
  // Multer instance exported for route middleware
  upload,
};
