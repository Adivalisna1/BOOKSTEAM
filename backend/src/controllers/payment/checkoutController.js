const checkoutService = require('../../services/payment/checkoutService');

/**
 * POST /api/v1/checkout
 * Body: { book_id, payment_method }
 * payment_method: 'wallet' | 'gopay' | 'ovo' | 'shopeepay' | 'qris' | 'credit_card'
 */
async function checkout(req, res, next) {
  try {
    const { book_id, payment_method } = req.body;
    const result = await checkoutService.checkout(req.user.id, {
      bookId: book_id,
      payment_method,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { checkout };
