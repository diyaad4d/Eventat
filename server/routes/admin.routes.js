const express   = require('express');
const router    = express.Router();
const { body, param, query } = require('express-validator');
const adminCtrl = require('../controllers/admin.controller');

// ── Middleware — all DEFAULT exports (no destructuring!) ──────────────────
// WRONG in prompt: const { verifyToken } = require('../middleware/auth.middleware')
// RIGHT:           const verifyToken     = require('../middleware/auth.middleware')
const verifyToken  = require('../middleware/auth.middleware');
const requireRole  = require('../middleware/role.middleware');
const validate     = require('../middleware/validate.middleware');

// Admin-only guard — applied to every route in this file
const adminOnly = [verifyToken, requireRole('admin')];

// ── Shared validation helpers ─────────────────────────────────────────────

const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer.'),
];

const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer.'),
];

const validateSubId = [
  param('subId')
    .isInt({ min: 1 })
    .withMessage('Subcategory ID must be a positive integer.'),
];

// ── Platform stats ────────────────────────────────────────────────────────
router.get('/admin/stats',
  ...adminOnly,
  adminCtrl.getPlatformStats
);

// ── Analytics ─────────────────────────────────────────────────────────────
router.get('/admin/analytics',
  ...adminOnly,
  adminCtrl.getAdminAnalytics
);

// ── Vendor management ─────────────────────────────────────────────────────
// IMPORTANT ORDER: specific paths (/admin/vendors) BEFORE parameterized (/admin/vendors/:id)
// and action paths (/approve, /reject, /approve-changes) all before /:id bare GET

router.get('/admin/vendors',
  ...adminOnly,
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected'])
      .withMessage('status must be pending, approved, or rejected.'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
  ],
  validate,
  adminCtrl.getVendors
);

router.get('/admin/vendors/:id',
  ...adminOnly,
  validateId,
  validate,
  adminCtrl.getVendorById
);

router.put('/admin/vendors/:id/approve',
  ...adminOnly,
  validateId,
  validate,
  adminCtrl.approveVendor
);

router.put('/admin/vendors/:id/reject',
  ...adminOnly,
  validateId,
  [
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must be under 500 characters.'),
  ],
  validate,
  adminCtrl.rejectVendor
);

router.put('/admin/vendors/:id/approve-changes',
  ...adminOnly,
  validateId,
  validate,
  adminCtrl.approveVendorChanges
);

// ── User management ───────────────────────────────────────────────────────
router.get('/admin/users',
  ...adminOnly,
  [
    query('role').optional().isIn(['customer', 'vendor', 'admin'])
      .withMessage('role must be customer, vendor, or admin.'),
    query('status').optional().isIn(['active', 'banned'])
      .withMessage('status must be active or banned.'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
  ],
  validate,
  adminCtrl.getUsers
);

router.put('/admin/users/:userId/ban',
  ...adminOnly,
  validateUserId,
  validate,
  adminCtrl.toggleUserBan
);

// ── Category management ───────────────────────────────────────────────────
// ORDER CRITICAL: /admin/subcategories/:subId BEFORE /admin/categories/:id
// to prevent 'subcategories' being treated as :id

router.get('/admin/categories',
  ...adminOnly,
  adminCtrl.getCategories
);

router.post('/admin/categories',
  ...adminOnly,
  [
    body('name')
      .notEmpty().withMessage('name is required.')
      .isLength({ min: 2, max: 80 })
      .withMessage('name must be 2–80 characters.'),
    body('icon')
      .notEmpty().withMessage('icon is required.')
      .isLength({ max: 10 })
      .withMessage('icon must be 10 characters or fewer (emoji).'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be boolean.'),
    body('slug')
      .optional()
      .isSlug().withMessage('slug must be lowercase letters, numbers, and hyphens only.'),
  ],
  validate,
  adminCtrl.createCategory
);

// ── Subcategory routes BEFORE /:id category routes ────────────────────────
// CRITICAL: These must come before /admin/categories/:id to avoid 'subcategories'
//           being captured as the :id param value.

router.put('/admin/subcategories/:subId',
  ...adminOnly,
  validateSubId,
  [
    body('name').optional().isLength({ min: 2, max: 80 })
      .withMessage('name must be 2–80 characters.'),
    body('slug').optional().isSlug()
      .withMessage('slug must be lowercase letters, numbers, and hyphens only.'),
    body('is_active').optional().isBoolean()
      .withMessage('is_active must be boolean.'),
  ],
  validate,
  adminCtrl.updateSubcategory
);

router.delete('/admin/subcategories/:subId',
  ...adminOnly,
  validateSubId,
  validate,
  adminCtrl.deleteSubcategory
);

// ── Category CRUD (with :id) ──────────────────────────────────────────────
router.put('/admin/categories/:id',
  ...adminOnly,
  validateId,
  [
    body('name').optional().isLength({ min: 2, max: 80 })
      .withMessage('name must be 2–80 characters.'),
    body('icon').optional().isLength({ max: 10 })
      .withMessage('icon must be 10 characters or fewer.'),
    body('is_active').optional().isBoolean()
      .withMessage('is_active must be boolean.'),
    body('slug').optional().isSlug()
      .withMessage('slug must be lowercase letters, numbers, and hyphens only.'),
  ],
  validate,
  adminCtrl.updateCategory
);

router.delete('/admin/categories/:id',
  ...adminOnly,
  validateId,
  validate,
  adminCtrl.deleteCategory
);

router.post('/admin/categories/:id/subcategories',
  ...adminOnly,
  validateId,
  [
    body('name')
      .notEmpty().withMessage('name is required.')
      .isLength({ min: 2, max: 80 })
      .withMessage('name must be 2–80 characters.'),
    body('slug').optional().isSlug()
      .withMessage('slug must be lowercase letters, numbers, and hyphens only.'),
    body('is_active').optional().isBoolean()
      .withMessage('is_active must be boolean.'),
  ],
  validate,
  adminCtrl.createSubcategory
);

module.exports = router;
