const express   = require('express');
const router    = express.Router();
const { body }  = require('express-validator');
const usersCtrl = require('../controllers/users.controller');

// Middleware — exact default exports (no destructuring)
const verifyToken = require('../middleware/auth.middleware');
const validate    = require('../middleware/validate.middleware');

const authenticated = [verifyToken];

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/users/me — full profile, any authenticated role
router.get('/users/me',
  ...authenticated,
  usersCtrl.getMe
);

// PUT /api/users/me — update shared profile fields
router.put('/users/me',
  ...authenticated,
  [
    body('full_name')
      .optional()
      .isLength({ min: 2, max: 120 })
      .withMessage('full_name must be 2–120 characters.'),
    body('phone')
      .optional()
      .isLength({ min: 7, max: 20 })
      .withMessage('phone must be 7–20 characters.'),
    // avatar_url stored on customer_profiles (not users) — passed as URL string
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('avatar_url must be a valid URL.'),
    // Vendor instant-update fields (no sensitive changes here)
    body('company_description')
      .optional()
      .isLength({ min: 10 })
      .withMessage('company_description must be at least 10 characters.'),
    body('city')
      .optional()
      .isLength({ min: 2 })
      .withMessage('city must be at least 2 characters.'),
  ],
  validate,
  usersCtrl.updateMe
);

// PUT /api/users/me/password — change password, any authenticated role
router.put('/users/me/password',
  ...authenticated,
  [
    body('current_password')
      .notEmpty().withMessage('current_password is required.'),
    body('new_password')
      .notEmpty().withMessage('new_password is required.')
      .isLength({ min: 8, max: 100 })
      .withMessage('new_password must be 8–100 characters.'),
    body('confirm_password')
      .notEmpty().withMessage('confirm_password is required.'),
  ],
  validate,
  usersCtrl.changePassword
);

// DELETE /api/users/me — soft-delete own account, any authenticated role
router.delete('/users/me',
  ...authenticated,
  usersCtrl.deleteMe
);

module.exports = router;
