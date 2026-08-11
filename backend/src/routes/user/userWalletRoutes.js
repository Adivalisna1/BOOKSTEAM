const express = require('express');
const { param, query } = require('express-validator');
const userWalletController = require('../../controllers/user/userWalletController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

const txIdParam = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

// GET /api/v1/user/wallet
router.get('/', userWalletController.getWallet);

// GET /api/v1/user/wallet/topup-history
router.get('/topup-history', paginationQuery, validateRequest, userWalletController.getTopUpHistory);

// GET /api/v1/user/transactions
router.get(
  '/transactions',
  [
    ...paginationQuery,
    query('status').optional().isIn(['pending', 'completed', 'refunded']),
  ],
  validateRequest,
  userWalletController.getTransactions
);

// GET /api/v1/user/transactions/:id
router.get('/transactions/:id', txIdParam, validateRequest, userWalletController.getTransactionById);

module.exports = router;
