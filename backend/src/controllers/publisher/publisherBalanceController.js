const publisherBalanceService = require('../../services/publisher/publisherBalanceService');

/** GET /api/v1/publisher/balance */
async function getBalance(req, res, next) {
  try {
    const data = await publisherBalanceService.getBalance(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/v1/publisher/balance/revenue */
async function getRevenueHistory(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await publisherBalanceService.getRevenueHistory(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
    });
    res.json({ success: true, data: result.revenue_history, pagination: result.pagination });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/publisher/balance/withdraw
 * Body: { amount, bank_name, account_number }
 */
async function requestWithdrawal(req, res, next) {
  try {
    const { amount, bank_name, account_number } = req.body;
    const result = await publisherBalanceService.requestWithdrawal(req.user.id, {
      amount: parseFloat(amount),
      bank_name,
      account_number,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** GET /api/v1/publisher/balance/withdrawals */
async function getWithdrawalHistory(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await publisherBalanceService.getWithdrawalHistory(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
    });
    res.json({ success: true, data: result.withdrawals, pagination: result.pagination });
  } catch (err) { next(err); }
}

module.exports = { getBalance, getRevenueHistory, requestWithdrawal, getWithdrawalHistory };
