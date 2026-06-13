const express      = require('express');
const router       = express.Router();
const { body, param } = require('express-validator');
const bookingsCtrl = require('../controllers/bookings.controller');
const paymentCtrl  = require('../controllers/payment.controller');
const verifyToken  = require('../middleware/auth.middleware');
const requireRole  = require('../middleware/role.middleware');
const validate     = require('../middleware/validate.middleware');

// Composed middleware: must be authenticated + customer role
const customerOnly = [verifyToken, requireRole('customer')];

// ── Shared validation chains ────────────────────────────────────────────────

const validateServiceId = [
  body('service_id')
    .notEmpty().withMessage('service_id is required.')
    .isInt({ min: 1 }).withMessage('service_id must be a positive integer.'),
];

const validateEventDate = [
  body('event_date')
    .notEmpty().withMessage('event_date is required.')
    .isDate().withMessage('event_date must be a valid date (YYYY-MM-DD).')
    .custom((val) => {
      if (new Date(val) <= new Date()) {
        throw new Error('event_date must be in the future.');
      }
      return true;
    }),
];

const validatePaymentMethod = [
  body('payment_method')
    .notEmpty().withMessage('payment_method is required.')
    .isIn(['full_online', 'cash_deposit'])
    .withMessage('payment_method must be full_online or cash_deposit.'),
];

const validatePlanId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Plan ID must be a positive integer.'),
];

const validateBookingId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Booking ID must be a positive integer.'),
];

// ── Booking routes ──────────────────────────────────────────────────────────
// IMPORTANT: /bookings/my MUST be defined before /bookings/:id

// POST /api/bookings — Direct Book Now
router.post('/bookings',
  ...customerOnly,
  validateServiceId,
  validateEventDate,
  validatePaymentMethod,
  validate,
  bookingsCtrl.createDirectBooking
);

// GET /api/bookings/my — All customer's bookings
router.get('/bookings/my',
  ...customerOnly,
  bookingsCtrl.getMyBookings
);

// GET /api/bookings/:id — Single booking detail
router.get('/bookings/:id',
  ...customerOnly,
  validateBookingId,
  validate,
  bookingsCtrl.getBookingById
);

// PATCH /api/bookings/:id/cancel — Cancel a booking
router.patch('/bookings/:id/cancel',
  ...customerOnly,
  validateBookingId,
  validate,
  bookingsCtrl.cancelBooking
);

// ── Event Plan routes ───────────────────────────────────────────────────────
// IMPORTANT: /event-plans/my MUST be defined before /event-plans/:id

// POST /api/event-plans — Create empty event plan (Cart)
router.post('/event-plans',
  ...customerOnly,
  [
    body('name')
      .notEmpty().withMessage('Plan name is required.')
      .isLength({ min: 2, max: 150 }).withMessage('Plan name must be between 2 and 150 characters.'),
    body('event_type_id')
      .optional()
      .isInt({ min: 1 }).withMessage('event_type_id must be a positive integer.'),
  ],
  validate,
  bookingsCtrl.createEventPlan
);

// GET /api/event-plans/my — All customer's plans
router.get('/event-plans/my',
  ...customerOnly,
  bookingsCtrl.getMyEventPlans
);

// GET /api/event-plans/:id — Single plan with items
router.get('/event-plans/:id',
  ...customerOnly,
  validatePlanId,
  validate,
  bookingsCtrl.getEventPlanById
);

// PATCH /api/event-plans/:id — Update plan name / event_type
router.patch('/event-plans/:id',
  ...customerOnly,
  validatePlanId,
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 150 }).withMessage('Plan name must be between 2 and 150 characters.'),
    body('event_type_id')
      .optional()
      .isInt({ min: 1 }).withMessage('event_type_id must be a positive integer.'),
  ],
  validate,
  bookingsCtrl.updateEventPlan
);

// DELETE /api/event-plans/:id — Delete a draft plan
router.delete('/event-plans/:id',
  ...customerOnly,
  validatePlanId,
  validate,
  bookingsCtrl.deleteEventPlan
);

// POST /api/event-plans/:id/items — Add service to plan (Add to Cart)
router.post('/event-plans/:id/items',
  ...customerOnly,
  validatePlanId,
  validateServiceId,
  validateEventDate,
  validatePaymentMethod,
  validate,
  bookingsCtrl.addItemToPlan
);

// DELETE /api/event-plans/:planId/items/:itemId — Remove an item from a draft plan
router.delete('/event-plans/:planId/items/:itemId',
  ...customerOnly,
  [
    param('planId').isInt({ min: 1 }).withMessage('Invalid plan ID.'),
    param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID.'),
  ],
  validate,
  bookingsCtrl.removeItemFromPlan
);

// PATCH /api/event-plans/:planId/items/:itemId — Update and resend a rejected item
router.patch('/event-plans/:planId/items/:itemId',
  ...customerOnly,
  [
    param('planId').isInt({ min: 1 }).withMessage('Invalid plan ID.'),
    param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID.'),
    body('event_date').optional().isISO8601().withMessage('Invalid date format.'),
    body('guest_count').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validate,
  bookingsCtrl.updatePlanItem
);

// POST /api/event-plans/:id/submit — Submit draft plan
router.post('/event-plans/:id/submit',
  ...customerOnly,
  validatePlanId,
  validate,
  bookingsCtrl.submitEventPlan
);

// POST /api/event-plans/:id/pay — Pay for a confirmed plan
router.post('/event-plans/:id/pay',
  ...customerOnly,
  validatePlanId,
  [
    body('payment_method')
      .optional()
      .isIn(['full_online', 'cash_deposit'])
      .withMessage('payment_method must be full_online or cash_deposit.'),
  ],
  validate,
  paymentCtrl.payEventPlan
);

// GET /api/event-plans/:id/payment — Get payment record + escrow for a plan
router.get('/event-plans/:id/payment',
  ...customerOnly,
  validatePlanId,
  validate,
  paymentCtrl.getEventPlanPayment
);

// POST /api/event-plans/:id/complete — Mark event as complete and release escrow
router.post('/event-plans/:id/complete',
  ...customerOnly,
  validatePlanId,
  validate,
  paymentCtrl.completeEventPlan
);

module.exports = router;

