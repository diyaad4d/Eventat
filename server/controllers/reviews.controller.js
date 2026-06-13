const db = require('../db');

// ---------------------------------------------------------------------------
// SCHEMA REFERENCE (verified from 001_initial_schema.sql)
//
// reviews table:
//   PK:           review_id
//   service FK:   service_id
//   customer FK:  customer_id
//   rating:       INTEGER CHECK (1–5)
//   text col:     review_text (TEXT)
//   other:        event_item_id (nullable FK to event_plan_items)
//   timestamps:   created_at ONLY — NO updated_at!
//   UNIQUE:       (service_id, customer_id) — one review per customer per service
//
// event_plan_items:
//   status col:   vendor_item_status ENUM: 'pending','accepted','rejected','completed','cancelled'
//   Eligible for review: 'accepted' OR 'completed'
//   plan FK:      event_id (not event_plan_id!)
//   service FK:   service_id
//
// notifications:
//   message col:  message_body (NOT 'message' or 'body')
//   type col:     notification_type (VARCHAR — no ENUM constraint)
//
// users:
//   avatar_url is on customer_profiles, NOT on users table!
//   users has: user_id, role, username, email, password_hash,
//              full_name, phone, is_active, created_at, updated_at
//
// JWT payload: { userId, role } → req.user.userId (NOT req.user.user_id)
// ---------------------------------------------------------------------------

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
// HELPER — recalculate and update service avg_rating + review_count
// ---------------------------------------------------------------------------
const recalculateServiceRating = async (serviceId) => {
  await db.query(
    `UPDATE services
     SET avg_rating = COALESCE(
           (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE service_id = $1),
           0
         ),
         review_count = (SELECT COUNT(*) FROM reviews WHERE service_id = $1),
         updated_at = NOW()
     WHERE service_id = $1`,
    [serviceId]
  );
};

// ---------------------------------------------------------------------------
// FUNCTION 1: POST /api/services/:serviceId/reviews
// Create a new review — customer only, must have a qualifying booking
// ---------------------------------------------------------------------------
const createReview = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const serviceId  = parseInt(req.params.serviceId, 10);
    const { rating, review_text } = req.body;

    // Step 1: Verify the service exists and is active
    const svcRes = await db.query(
      `SELECT service_id, title, vendor_id FROM services
       WHERE service_id = $1 AND is_active = true`,
      [serviceId]
    );
    if (svcRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }
    const service = svcRes.rows[0];

    // Step 2: Check eligibility — customer must have an accepted/completed booking
    // vendor_item_status ENUM: 'accepted' = confirmed by vendor, 'completed' = done
    const eligRes = await db.query(
      `SELECT epi.event_item_id
       FROM event_plan_items epi
       JOIN event_plans ep ON epi.event_id = ep.event_id
       WHERE epi.service_id = $1
         AND ep.customer_id = $2
         AND epi.vendor_item_status IN ('accepted', 'completed')
       LIMIT 1`,
      [serviceId, customerId]
    );
    if (eligRes.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You must have a confirmed booking for this service before leaving a review.',
        code: 'NOT_ELIGIBLE',
      });
    }
    const qualifyingItemId = eligRes.rows[0].event_item_id;

    // Step 3: Check for duplicate (UNIQUE constraint: service_id + customer_id)
    const dupeRes = await db.query(
      `SELECT review_id FROM reviews
       WHERE service_id = $1 AND customer_id = $2`,
      [serviceId, customerId]
    );
    if (dupeRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'You have already reviewed this service.',
        code: 'DUPLICATE_REVIEW',
      });
    }

    // Step 4 + 5: INSERT review + recalculate rating in a transaction
    // (touches 2 tables: reviews + services)
    await db.query('BEGIN');
    let newReview;
    try {
      const insertRes = await db.query(
        `INSERT INTO reviews
           (service_id, customer_id, event_item_id, rating, review_text)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [serviceId, customerId, qualifyingItemId, parseFloat(rating), review_text]
      );
      newReview = insertRes.rows[0];

      // Recalculate service avg_rating and review_count within transaction
      await db.query(
        `UPDATE services
         SET avg_rating = (
               SELECT ROUND(AVG(rating)::numeric, 2)
               FROM reviews WHERE service_id = $1
             ),
             review_count = (
               SELECT COUNT(*) FROM reviews WHERE service_id = $1
             ),
             updated_at = NOW()
         WHERE service_id = $1`,
        [serviceId]
      );

      await db.query('COMMIT');
    } catch (txErr) {
      await db.query('ROLLBACK');
      throw txErr;
    }

    // Step 6: Notify vendor (non-blocking)
    // Get customer name for notification message
    const customerRes = await db.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [customerId]
    );
    const customerName = customerRes.rows[0]?.full_name || 'A customer';

    await sendNotification({
      userId: service.vendor_id,
      title: 'New Review Received',
      messageBody: `${customerName} left a ${rating}-star review on "${service.title}".`,
      notificationType: 'review_new',
      actionUrl: '/vendor/profile',
    });

    // Fetch reviewer info to include in response
    const reviewerRes = await db.query(
      `SELECT u.full_name AS reviewer_name,
              cp.avatar_url AS reviewer_avatar
       FROM users u
       LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
       WHERE u.user_id = $1`,
      [customerId]
    );
    const reviewer = reviewerRes.rows[0] || {};

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: {
        review: {
          ...newReview,
          reviewer_name:   reviewer.reviewer_name   || null,
          reviewer_avatar: reviewer.reviewer_avatar || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: GET /api/services/:serviceId/reviews
// Paginated reviews for a service — public, no auth required
// ---------------------------------------------------------------------------
const getServiceReviews = async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.serviceId, 10);
    const sort      = req.query.sort || 'newest';
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset    = (page - 1) * limit;

    // Build ORDER BY based on sort param
    // Note: reviews has NO updated_at — only created_at
    let orderByClause;
    if (sort === 'highest') {
      orderByClause = 'r.rating DESC, r.created_at DESC';
    } else if (sort === 'lowest') {
      orderByClause = 'r.rating ASC, r.created_at DESC';
    } else {
      // 'newest' is default
      orderByClause = 'r.created_at DESC';
    }

    // Main reviews query
    // avatar_url is on customer_profiles (NOT on users table!)
    const reviewsRes = await db.query(
      `SELECT
         r.review_id,
         r.rating,
         r.review_text,
         r.created_at,
         u.user_id          AS reviewer_id,
         u.full_name        AS reviewer_name,
         cp.avatar_url      AS reviewer_avatar,
         COUNT(*) OVER()    AS total_count
       FROM reviews r
       JOIN users u ON r.customer_id = u.user_id
       LEFT JOIN customer_profiles cp ON u.user_id = cp.customer_id
       WHERE r.service_id = $1
       ORDER BY ${orderByClause}
       LIMIT $2 OFFSET $3`,
      [serviceId, limit, offset]
    );

    const total      = reviewsRes.rows.length > 0 ? parseInt(reviewsRes.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const reviews    = reviewsRes.rows.map(({ total_count, ...row }) => row);

    // Rating breakdown — always show all 5 stars even if count = 0
    const breakdownRes = await db.query(
      `SELECT rating, COUNT(*) AS count
       FROM reviews
       WHERE service_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [serviceId]
    );

    // Build complete breakdown for stars 5→1
    const breakdownMap = {};
    breakdownRes.rows.forEach(row => {
      breakdownMap[row.rating] = parseInt(row.count);
    });

    const breakdown = [5, 4, 3, 2, 1].map(star => ({
      rating:     star,
      count:      breakdownMap[star] || 0,
      percentage: total > 0 ? Math.round(((breakdownMap[star] || 0) / total) * 100) : 0,
    }));

    // Compute overall avg from breakdown
    const totalRatingSum = breakdown.reduce((sum, b) => sum + b.rating * b.count, 0);
    const avgRating = total > 0 ? Math.round((totalRatingSum / total) * 10) / 10 : 0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          avg_rating:    avgRating,
          total_reviews: total,
          breakdown,
        },
        pagination: {
          total, page, limit, totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 3: PATCH /api/reviews/:reviewId
// Update own review — customer only
// ---------------------------------------------------------------------------
const updateReview = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const reviewId   = parseInt(req.params.reviewId, 10);
    const { rating, review_text } = req.body;

    if (rating === undefined && review_text === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one field to update: rating or review_text.',
      });
    }

    // Step 1: Find review + verify ownership
    const findRes = await db.query(
      `SELECT r.review_id, r.service_id, r.customer_id
       FROM reviews r
       WHERE r.review_id = $1 AND r.customer_id = $2`,
      [reviewId, customerId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found or does not belong to you.',
        code: 'REVIEW_NOT_FOUND',
      });
    }
    const existing = findRes.rows[0];

    // Step 2: Build dynamic UPDATE — only provided fields
    // reviews has NO updated_at column!
    const updates = [];
    const params  = [];

    if (rating !== undefined) {
      params.push(parseFloat(rating));
      updates.push(`rating = $${params.length}`);
    }
    if (review_text !== undefined) {
      params.push(review_text);
      updates.push(`review_text = $${params.length}`);
    }

    params.push(reviewId);
    const sql = `
      UPDATE reviews
      SET ${updates.join(', ')}
      WHERE review_id = $${params.length}
      RETURNING *
    `;

    const updateRes = await db.query(sql, params);
    const updatedReview = updateRes.rows[0];

    // Step 3: Recalculate service avg_rating after update
    await recalculateServiceRating(existing.service_id);

    return res.status(200).json({
      success: true,
      message: 'Review updated.',
      data: { review: updatedReview },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 4: DELETE /api/reviews/:reviewId
// Delete a review — customer (own) OR admin (any)
// ---------------------------------------------------------------------------
const deleteReview = async (req, res, next) => {
  try {
    const actorId  = req.user.userId;
    const actorRole = req.user.role;
    const reviewId  = parseInt(req.params.reviewId, 10);

    // Step 1: Find the review
    const findRes = await db.query(
      `SELECT review_id, service_id, customer_id FROM reviews WHERE review_id = $1`,
      [reviewId]
    );
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found.', code: 'REVIEW_NOT_FOUND' });
    }
    const review = findRes.rows[0];

    // Step 2: Authorization — customer must own it, admin can delete any
    if (actorRole === 'customer' && review.customer_id !== actorId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only delete your own reviews.',
      });
    }
    if (actorRole !== 'customer' && actorRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    // Step 3: Delete
    await db.query(`DELETE FROM reviews WHERE review_id = $1`, [reviewId]);

    // Step 4: Recalculate service avg_rating + review_count
    // If no reviews remain, recalculateServiceRating sets avg_rating = 0
    await recalculateServiceRating(review.service_id);

    return res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 5: GET /api/services/:serviceId/reviews/eligibility
// Check if logged-in customer can review this service
// ---------------------------------------------------------------------------
const checkEligibility = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const serviceId  = parseInt(req.params.serviceId, 10);

    // Run both checks in parallel
    const [bookingRes, reviewRes] = await Promise.all([
      // CHECK 1: Does customer have an accepted/completed booking for this service?
      db.query(
        `SELECT epi.event_item_id
         FROM event_plan_items epi
         JOIN event_plans ep ON epi.event_id = ep.event_id
         WHERE epi.service_id = $1
           AND ep.customer_id = $2
           AND epi.vendor_item_status IN ('accepted', 'completed')
         LIMIT 1`,
        [serviceId, customerId]
      ),
      // CHECK 2: Has customer already reviewed this service?
      db.query(
        `SELECT review_id FROM reviews
         WHERE service_id = $1 AND customer_id = $2
         LIMIT 1`,
        [serviceId, customerId]
      ),
    ]);

    const hasBooking  = bookingRes.rows.length > 0;
    const hasReviewed = reviewRes.rows.length > 0;
    const canReview   = hasBooking && !hasReviewed;

    let reason = null;
    if (!canReview) {
      if (!hasBooking) {
        reason = 'You need a confirmed booking to review this service.';
      } else if (hasReviewed) {
        reason = 'You have already reviewed this service.';
      }
    }

    return res.status(200).json({
      success: true,
      data: { canReview, hasBooking, hasReviewed, reason },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getServiceReviews,
  updateReview,
  deleteReview,
  checkEligibility,
};
