const express = require('express');
const { query, body } = require('express-validator');
const publisherBalanceController = require('../../controllers/publisher/publisherBalanceController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

// GET /api/v1/publisher/balance
router.get('/', publisherBalanceController.getBalance);

// GET /api/v1/publisher/balance/revenue
router.get(
  '/revenue',
  [
    ...paginationQuery,
    query('status')
      .optional()
      .isIn(['holding', 'released', 'refunded'])
      .withMessage('status must be one of: holding, released, refunded'),
  ],
  validateRequest,
  publisherBalanceController.getRevenueHistory
);

// POST /api/v1/publisher/balance/withdraw
router.post(
  '/withdraw',
  [
    body('amount')
      .isFloat({ min: 50000 })
      .withMessage('amount must be at least 50000'),
    body('bank_name')
      .isString().trim().notEmpty()
      .isLength({ max: 100 })
      .withMessage('bank_name is required'),
    body('account_number')
      .isString().trim().notEmpty()
      .isLength({ max: 50 })
      .withMessage('account_number is required'),
  ],
  validateRequest,
  publisherBalanceController.requestWithdrawal
);

// GET /api/v1/publisher/balance/withdrawals
router.get(
  '/withdrawals',
  [
    ...paginationQuery,
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed'])
      .withMessage('status must be one of: pending, processing, completed, failed'),
  ],
  validateRequest,
  publisherBalanceController.getWithdrawalHistory
);

module.exports = router;
