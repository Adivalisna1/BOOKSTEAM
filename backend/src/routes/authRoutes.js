const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// =============================================
// POST /api/v1/auth/register
// =============================================
router.post(
  '/register',
  [
    body('email')
      .isEmail().normalizeEmail()
      .withMessage('Valid email is required'),
    body('username')
      .isString().trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  validateRequest,
  authController.register
);

// =============================================
// POST /api/v1/auth/login
// =============================================
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// =============================================
// POST /api/v1/auth/logout
// =============================================
router.post(
  '/logout',
  [
    body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  ],
  validateRequest,
  authController.logout
);

// =============================================
// POST /api/v1/auth/refresh
// =============================================
router.post(
  '/refresh',
  [
    body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  ],
  validateRequest,
  authController.refresh
);

// =============================================
// GET /api/v1/auth/me  — requires valid JWT
// =============================================
router.get('/me', authenticate, authController.me);

// =============================================
// POST /api/v1/auth/verify-email
// =============================================
router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('token is required'),
  ],
  validateRequest,
  authController.verifyEmail
);

// =============================================
// POST /api/v1/auth/resend-verification  — requires login
// =============================================
router.post('/resend-verification', authenticate, authController.resendVerification);

// =============================================
// POST /api/v1/auth/forgot-password
// =============================================
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  authController.forgotPassword
);

// =============================================
// POST /api/v1/auth/reset-password
// =============================================
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('token is required'),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  validateRequest,
  authController.resetPassword
);

module.exports = router;
