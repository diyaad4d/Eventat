const express     = require('express');
const router      = express.Router();
const { body, param } = require('express-validator');
const vendorsCtrl = require('../controllers/vendors.controller');

// Middleware — exact exports verified from source files:
//   auth.middleware.js  → module.exports = authMiddleware  (default, no destructure)
//   role.middleware.js  → module.exports = requireRole     (default, no destructure)
//   validate.middleware.js → module.exports = validate     (not handleValidationErrors)
const verifyToken  = require('../middleware/auth.middleware');
const requireRole  = require('../middleware/role.middleware');
const validate     = require('../middleware/validate.middleware');

// Composed guard: must be authenticated vendor
const vendorOnly = [verifyToken, requireRole('vendor')];

// ── Multer error handler ────────────────────────────────────────────────────
// Catches multer-specific errors (file type, size) gracefully
const handleMulterError = (err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
  }
  if (err && err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
};

// ── Shared validation chains ────────────────────────────────────────────────

const validateServiceId = [
  param('id').isInt({ min: 1 }).withMessage('Service ID must be a positive integer.'),
];

const validateItemId = [
  param('itemId').isInt({ min: 1 }).withMessage('Booking item ID must be a positive integer.'),
];

const validateImageId = [
  param('imageId').isInt({ min: 1 }).withMessage('Image ID must be a positive integer.'),
];

const validateCreateService = [
  body('title')
    .notEmpty().withMessage('title is required.')
    .isLength({ min: 3, max: 150 }).withMessage('title must be 3–150 characters.'),
  body('description')
    .notEmpty().withMessage('description is required.')
    .isLength({ min: 50 }).withMessage('description must be at least 50 characters.'),
  body('base_price')
    .notEmpty().withMessage('base_price is required.')
    .isFloat({ min: 0.01 }).withMessage('base_price must be a positive number.'),
  body('pricing_unit')
    .notEmpty().withMessage('pricing_unit is required.')
    .isIn(['per_event', 'per_hour', 'per_person', 'per_day'])
    .withMessage('pricing_unit must be one of: per_event, per_hour, per_person, per_day.'),
  body('category_id')
    .notEmpty().withMessage('category_id is required.')
    .isInt({ min: 1 }).withMessage('category_id must be a positive integer.'),
  body('city')
    .notEmpty().withMessage('city is required.')
    .isLength({ min: 2 }).withMessage('city must be at least 2 characters.'),
  body('subcategory_id').optional().isInt({ min: 1 }).withMessage('subcategory_id must be a positive integer.'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('capacity must be a positive integer.'),
];

// ── Service Routes ──────────────────────────────────────────────────────────

// GET /api/vendor/services — vendor's own services
router.get('/vendor/services',
  ...vendorOnly,
  vendorsCtrl.getMyServices
);

// POST /api/vendor/services — create service
router.post('/vendor/services',
  ...vendorOnly,
  validateCreateService,
  validate,
  vendorsCtrl.createService
);

// IMPORTANT: /status MUST come before /:id to avoid being caught as { id: "status" }
// PATCH /api/vendor/services/:id/status — toggle active/inactive
router.patch('/vendor/services/:id/status',
  ...vendorOnly,
  validateServiceId,
  [
    body('is_active')
      .notEmpty().withMessage('is_active is required.')
      .isBoolean().withMessage('is_active must be true or false.'),
  ],
  validate,
  vendorsCtrl.toggleServiceStatus
);

// PATCH /api/vendor/services/:id — update service fields
router.patch('/vendor/services/:id',
  ...vendorOnly,
  validateServiceId,
  [
    body('title').optional().isLength({ min: 3, max: 150 }).withMessage('title must be 3–150 characters.'),
    body('description').optional().isLength({ min: 50 }).withMessage('description must be at least 50 characters.'),
    body('base_price').optional().isFloat({ min: 0.01 }).withMessage('base_price must be a positive number.'),
    body('pricing_unit').optional()
      .isIn(['per_event', 'per_hour', 'per_person', 'per_day'])
      .withMessage('Invalid pricing_unit.'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('category_id must be a positive integer.'),
    body('subcategory_id').optional().isInt({ min: 1 }).withMessage('subcategory_id must be a positive integer.'),
    body('city').optional().isLength({ min: 2 }).withMessage('city must be at least 2 characters.'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('capacity must be a positive integer.'),
  ],
  validate,
  vendorsCtrl.updateService
);

// POST /api/vendor/services/:id/images — upload images (multer before controller)
router.post('/vendor/services/:id/images',
  ...vendorOnly,
  validateServiceId,
  validate,
  vendorsCtrl.upload.array('images', 8),
  handleMulterError,
  vendorsCtrl.uploadServiceImages
);

// DELETE /api/vendor/services/:id/images/:imageId — delete a specific image
router.delete('/vendor/services/:id/images/:imageId',
  ...vendorOnly,
  validateServiceId,
  validateImageId,
  validate,
  vendorsCtrl.deleteServiceImage
);

// ── Booking Routes ──────────────────────────────────────────────────────────

// GET /api/vendor/bookings — vendor's booking requests
router.get('/vendor/bookings',
  ...vendorOnly,
  vendorsCtrl.getMyBookingRequests
);

// IMPORTANT: /accept and /reject MUST come before /:itemId catch-alls
// PATCH /api/vendor/bookings/:itemId/accept — accept booking
router.patch('/vendor/bookings/:itemId/accept',
  ...vendorOnly,
  validateItemId,
  validate,
  vendorsCtrl.acceptBooking
);

// PATCH /api/vendor/bookings/:itemId/reject — reject booking
router.patch('/vendor/bookings/:itemId/reject',
  ...vendorOnly,
  validateItemId,
  [
    body('reason')
      .optional()
      .isLength({ max: 500 }).withMessage('Reason must be under 500 characters.'),
  ],
  validate,
  vendorsCtrl.rejectBooking
);

// ── Profile Routes ──────────────────────────────────────────────────────────

// GET /api/vendor/profile — full vendor profile with stats
router.get('/vendor/profile',
  ...vendorOnly,
  vendorsCtrl.getVendorProfile
);

// PATCH /api/vendor/profile — update profile (instant + pending-approval)
router.patch('/vendor/profile',
  ...vendorOnly,
  [
    body('company_description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters.'),
    body('city').optional().isLength({ min: 2 }).withMessage('City must be at least 2 characters.'),
    body('phone').optional().isMobilePhone().withMessage('Must be a valid phone number.'),
    body('company_name').optional().isLength({ min: 2, max: 150 }).withMessage('Company name must be 2–150 characters.'),
    body('iban').optional().isLength({ min: 15 }).withMessage('IBAN must be at least 15 characters.'),
    body('preferred_category_id').optional().isInt({ min: 1 }).withMessage('preferred_category_id must be a positive integer.'),
  ],
  validate,
  vendorsCtrl.updateVendorProfile
);

// POST /api/vendor/profile/logo — upload logo (multer before controller)
router.post('/vendor/profile/logo',
  ...vendorOnly,
  vendorsCtrl.upload.single('logo'),
  handleMulterError,
  vendorsCtrl.uploadVendorLogo
);

// ── Analytics Routes ────────────────────────────────────────────────────────

// GET /api/vendor/analytics — KPIs, monthly data, top services
router.get('/vendor/analytics',
  ...vendorOnly,
  vendorsCtrl.getVendorAnalytics
);

// ── Payment Routes ──────────────────────────────────────────────────────────
// Note: using /vendors/me/... (plural) as specified in the task

// GET /api/vendors/me/payment — escrow balance + IBAN info
router.get('/vendors/me/payment',
  ...vendorOnly,
  vendorsCtrl.getPaymentInfo
);

// POST /api/vendors/me/payment/change-request — request IBAN change
router.post('/vendors/me/payment/change-request',
  ...vendorOnly,
  [
    body('new_iban')
      .notEmpty().withMessage('new_iban is required.')
      .isLength({ min: 15 }).withMessage('IBAN must be at least 15 characters.')
      .matches(/^[A-Z0-9]+$/).withMessage('IBAN must contain only uppercase letters and numbers.'),
    body('new_bank_name')
      .notEmpty().withMessage('new_bank_name is required.')
      .isLength({ min: 2, max: 100 }).withMessage('bank_name must be 2–100 characters.'),
  ],
  validate,
  vendorsCtrl.requestPaymentChange
);

module.exports = router;
