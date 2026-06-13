const express     = require('express');
const router      = express.Router();
const { body, param, query } = require('express-validator');
const reviewsCtrl = require('../controllers/reviews.controller');

// Middleware — exact exports verified from source files:
//   auth.middleware.js    → module.exports = authMiddleware  (default, no destructure)
//   role.middleware.js    → module.exports = requireRole     (default, no destructure)
//   validate.middleware.js → module.exports = validate       (NOT handleValidationErrors)
const verifyToken  = require('../middleware/auth.middleware');
const requireRole  = require('../middleware/role.middleware');
const validate     = require('../middleware/validate.middleware');

const customerOnly = [verifyToken, requireRole('customer')];

// ── Shared validation chains ────────────────────────────────────────────────

const validateServiceId = [
  param('serviceId')
    .isInt({ min: 1 })
    .withMessage('Service ID must be a positive integer.'),
];

const validateReviewId = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer.'),
];

const validateCreateReview = [
  body('rating')
    .notEmpty().withMessage('rating is required.')
    .isFloat({ min: 1, max: 5 })
    .withMessage('rating must be a number between 1 and 5.'),
  body('review_text')
    .notEmpty().withMessage('review_text is required.')
    .isLength({ min: 10, max: 1000 })
    .withMessage('review_text must be 10–1000 characters.'),
];

// ── Routes ──────────────────────────────────────────────────────────────────
// CRITICAL ORDER: /eligibility MUST come before /:reviewId
// to prevent Express treating 'eligibility' as a numeric :reviewId param

// GET /api/services/:serviceId/reviews/eligibility — customer only
router.get('/services/:serviceId/reviews/eligibility',
  ...customerOnly,
  validateServiceId,
  validate,
  reviewsCtrl.checkEligibility
);

// POST /api/services/:serviceId/reviews — customer only
router.post('/services/:serviceId/reviews',
  ...customerOnly,
  validateServiceId,
  validateCreateReview,
  validate,
  reviewsCtrl.createReview
);

// GET /api/services/:serviceId/reviews — public (no auth)
router.get('/services/:serviceId/reviews',
  validateServiceId,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
    query('sort').optional().isIn(['newest', 'highest', 'lowest']).withMessage('sort must be newest, highest, or lowest.'),
  ],
  validate,
  reviewsCtrl.getServiceReviews
);

// PATCH /api/reviews/:reviewId — customer only (ownership verified in controller)
router.patch('/reviews/:reviewId',
  verifyToken,
  requireRole('customer'),
  validateReviewId,
  [
    body('rating')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('rating must be a number between 1 and 5.'),
    body('review_text')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('review_text must be 10–1000 characters.'),
  ],
  validate,
  reviewsCtrl.updateReview
);

// DELETE /api/reviews/:reviewId — customer (own) OR admin (any)
// verifyToken only here; role check (customer owns it / admin can delete any) is in controller
router.delete('/reviews/:reviewId',
  verifyToken,
  validateReviewId,
  validate,
  reviewsCtrl.deleteReview
);

module.exports = router;
