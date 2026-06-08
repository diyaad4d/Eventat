const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Rate limiting configurations
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 2 : 100,
  message: { success: false, error: 'Too many registration attempts, please try again after an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});


router.post('/register', 
  registerLimiter,
  upload.fields([
    { name: 'commercialRegister', maxCount: 1 },
    { name: 'nationalIdFront', maxCount: 1 },
    { name: 'nationalIdBack', maxCount: 1 }
  ]),
  [
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
      
      body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least 1 number')
      .matches(/[@$!%*?&#]/).withMessage('Password must contain at least 1 special character (@, $, !, %, *, ?, &, #)'),

      body('username')
      .notEmpty().withMessage('Username is required'),

      body('full_name')
      .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),

      body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['customer', 'vendor']).withMessage('Role must be customer or vendor'),
      
      body('phone')
      .notEmpty().withMessage('Phone number is required')
      .isMobilePhone().withMessage('Must be a valid mobile phone number'),
      //  vendor 
      body('vendor_type').if(body('role').equals('vendor'))
        .notEmpty().withMessage('Vendor type is required for vendors')
        .isIn(['company', 'freelancer']).withMessage('Vendor type must be company or freelancer'),
        
      body('company_name').if(body('role').equals('vendor'))
        .notEmpty().withMessage('Company Name / Professional Name is required'),

      body('iban').if(body('role').equals('vendor'))
        .notEmpty().withMessage('IBAN is required for vendors'),

      body('city').if(body('role').equals('vendor'))
        .notEmpty().withMessage('City is required for vendors'),

      body('preferred_category_id').if(body('role').equals('vendor'))
        .optional()
        .isInt({ min: 1 }).withMessage('Category must be a valid ID.')
        .toInt(), // auto-convert string to integer

      body('company_description').if(body('role').equals('vendor'))
        .notEmpty().withMessage('About Your Work is required'),

  ],
  validate,
  authController.register
);



router.post('/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);


router.post('/logout', authController.logout);


router.get('/me', authMiddleware, authController.getMe);


router.post('/forgot-password', authController.forgotPassword);


router.post('/reset-password', authController.resetPassword);


module.exports = router;
