const topupService = require('../../services/payment/topupService');

/**
 * POST /api/v1/topup
 * Body: { amount, payment_method }
 * payment_method: 'gopay' | 'ovo' | 'shopeepay' | 'qris' | 'credit_card'
 */
async function initiateTopUp(req, res, next) {
  try {
    const { amount, payment_method } = req.body;
    const result = await topupService.initiateTopUp(req.user.id, {
      amount: parseFloat(amount),
      payment_method,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { initiateTopUp };
