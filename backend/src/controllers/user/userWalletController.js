const userWalletService = require('../../services/user/userWalletService');

/** GET /api/v1/user/wallet */
async function getWallet(req, res, next) {
  try {
    const data = await userWalletService.getWallet(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/v1/user/wallet/topup-history */
async function getTopUpHistory(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await userWalletService.getTopUpHistory(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result.topup_history, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/user/transactions */
async function getTransactions(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await userWalletService.getTransactions(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
    });
    res.json({ success: true, data: result.transactions, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/user/transactions/:id */
async function getTransactionById(req, res, next) {
  try {
    const tx = await userWalletService.getTransactionById(req.user.id, req.params.id);
    res.json({ success: true, data: tx });
  } catch (err) { next(err); }
}

module.exports = { getWallet, getTopUpHistory, getTransactions, getTransactionById };
