const crypto   = require('crypto');
const db       = require('../../config/database');
const midtrans = require('../../config/midtransHelper');
const { AppError } = require('../../middlewares/errorHandler');

const MIN_TOPUP = 10000;   // Rp 10.000
const MAX_TOPUP = 10000000; // Rp 10.000.000

/**
 * Initiate a wallet top-up via Midtrans Snap.
 * Creates a pending top_up_history record and returns payment URL.
 */
async function initiateTopUp(userId, { amount, payment_method }) {
  if (amount < MIN_TOPUP) {
    throw new AppError(`Minimum top-up amount is Rp ${MIN_TOPUP.toLocaleString('id-ID')}`, 400);
  }
  if (amount > MAX_TOPUP) {
    throw new AppError(`Maximum top-up amount is Rp ${MAX_TOPUP.toLocaleString('id-ID')}`, 400);
  }

  const { rows: userRows } = await db.query(
    'SELECT id, email, username FROM users WHERE id = ?',
    [userId]
  );
  if (userRows.length === 0) throw new AppError('User not found', 404);
  const user = userRows[0];

  const topupId = crypto.randomUUID();
  const orderId = `BS-TOPUP-${topupId}`;

  // Create pending record
  await db.query(
    `INSERT INTO top_up_history
      (id, user_id, amount, payment_method, midtrans_order_id, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [topupId, userId, amount, payment_method, orderId]
  );

  try {
    const snapResult = await midtrans.createSnapTransaction({
      orderId,
      grossAmount: amount,
      customerDetails: {
        first_name: user.username,
        email:      user.email,
      },
      itemDetails: [{
        id:       'wallet-topup',
        price:    Math.round(amount),
        quantity: 1,
        name:     'BookSteam Wallet Top-Up',
      }],
      paymentType: payment_method,
    });

    await db.query(
      'UPDATE top_up_history SET midtrans_payment_url = ?, updated_at = NOW() WHERE id = ?',
      [snapResult.redirect_url, topupId]
    );

    return {
      message:      'Top-up initiated. Complete payment via the provided URL.',
      topup_id:     topupId,
      amount,
      payment_method,
      snap_token:   snapResult.snap_token,
      payment_url:  snapResult.redirect_url,
    };
  } catch (err) {
    await db.query('DELETE FROM top_up_history WHERE id = ?', [topupId]);
    throw new AppError(`Payment gateway error: ${err.message}`, 502);
  }
}

module.exports = { initiateTopUp };
