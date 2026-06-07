const express   = require('express');
const router    = express.Router();
const { param, query } = require('express-validator');
const notifCtrl = require('../controllers/notifications.controller');

// Middleware — exact default exports (no destructuring)
const verifyToken = require('../middleware/auth.middleware');
const validate    = require('../middleware/validate.middleware');

const authenticated = [verifyToken];

// ── Routes ──────────────────────────────────────────────────────────────────
// CRITICAL ORDER: /read-all MUST come before /:id/read
// Otherwise Express treats the literal string 'read-all' as the :id parameter

// PUT /api/notifications/read-all — mark all as read
router.put('/notifications/read-all',
  ...authenticated,
  notifCtrl.markAllAsRead
);

// GET /api/notifications — paginated notifications for logged-in user
router.get('/notifications',
  ...authenticated,
  [
    query('unread_only')
      .optional()
      .isBoolean().withMessage('unread_only must be true or false.'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
  ],
  validate,
  notifCtrl.getNotifications
);

// PUT /api/notifications/:id/read — mark one as read
router.put('/notifications/:id/read',
  ...authenticated,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Notification ID must be a positive integer.'),
  ],
  validate,
  notifCtrl.markOneAsRead
);

module.exports = router;
