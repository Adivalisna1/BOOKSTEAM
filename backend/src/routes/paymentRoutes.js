const express = require('express');
const { body, param } = require('express-validator');

const checkoutController = require('../controllers/payment/checkoutController');
const topupController    = require('../controllers/payment/topupController');
const webhookController  = require('../controllers/payment/webhookController');
const returnController   = require('../controllers/payment/returnController');

const { validateRequest } = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

const PAYMENT_METHODS_MIDTRANS = ['gopay', 'ovo', 'shopeepay', 'qris', 'credit_card'];
const PAYMENT_METHODS_ALL      = ['wallet', ...PAYMENT_METHODS_MIDTRANS];

const txIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

// =============================================
// POST /api/v1/checkout
// Requires: JWT + any logged-in role
// =============================================
router.post(
  '/checkout',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  [
    body('book_id')
      .isUUID()
      .withMessage('book_id must be a valid UUID'),
    body('payment_method')
      .isIn(PAYMENT_METHODS_ALL)
      .withMessage(`payment_method must be one of: ${PAYMENT_METHODS_ALL.join(', ')}`),
  ],
  validateRequest,
  checkoutController.checkout
);

// =============================================
// POST /api/v1/topup
// Requires: JWT + any logged-in role
// =============================================
router.post(
  '/topup',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  [
    body('amount')
      .isFloat({ min: 10000, max: 10000000 })
      .withMessage('amount must be between 10000 and 10000000'),
    body('payment_method')
      .isIn(PAYMENT_METHODS_MIDTRANS)
      .withMessage(`payment_method must be one of: ${PAYMENT_METHODS_MIDTRANS.join(', ')}`),
  ],
  validateRequest,
  topupController.initiateTopUp
);

// =============================================
// POST /api/v1/payment/webhook
// PUBLIC — Midtrans calls this server-to-server
// Signature verified inside webhookService
// =============================================
router.post('/payment/webhook', webhookController.handleWebhook);

// =============================================
// GET  /api/v1/transactions/:id/return/check
// POST /api/v1/transactions/:id/return
// Requires: JWT + any logged-in role
// =============================================
router.get(
  '/transactions/:id/return/check',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  txIdParam,
  validateRequest,
  returnController.checkEligibility
);

router.post(
  '/transactions/:id/return',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  [
    ...txIdParam,
    body('reason')
      .optional()
      .isString().trim()
      .isLength({ max: 500 })
      .withMessage('reason must be at most 500 characters'),
  ],
  validateRequest,
  returnController.processReturn
);

module.exports = router;
