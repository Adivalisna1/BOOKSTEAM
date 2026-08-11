const axios  = require('axios');
const crypto = require('crypto');

const IS_PRODUCTION  = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY     = process.env.MIDTRANS_SERVER_KEY || '';
const BASE_URL       = IS_PRODUCTION
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';
const SNAP_BASE_URL  = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

/** Base64-encoded "SERVER_KEY:" used as Basic Auth. */
function _authHeader() {
  const encoded = Buffer.from(`${SERVER_KEY}:`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}

/**
 * Create a Snap payment session (hosted payment page).
 * Returns { token, redirect_url }
 *
 * @param {object} params
 * @param {string} params.orderId       - Unique order identifier
 * @param {number} params.grossAmount   - Total amount in IDR (integer)
 * @param {object} params.customerDetails
 * @param {Array}  params.itemDetails
 * @param {string} [params.paymentType] - 'gopay'|'ovo'|'shopeepay'|'qris'|'credit_card' or undefined (all)
 */
async function createSnapTransaction({ orderId, grossAmount, customerDetails, itemDetails, paymentType }) {
  const enabledPayments = paymentType ? [paymentType] : undefined;

  const payload = {
    transaction_details: {
      order_id:     orderId,
      gross_amount: Math.round(grossAmount),
    },
    customer_details: customerDetails,
    item_details:     itemDetails,
    ...(enabledPayments ? { enabled_payments: enabledPayments } : {}),
  };

  const { data } = await axios.post(`${SNAP_BASE_URL}/transactions`, payload, {
    headers: {
      ..._authHeader(),
      'Content-Type': 'application/json',
    },
  });

  return {
    snap_token:   data.token,
    redirect_url: data.redirect_url,
  };
}

/**
 * Get current transaction status from Midtrans.
 * @param {string} orderId
 */
async function getTransactionStatus(orderId) {
  const { data } = await axios.get(`${BASE_URL}/${orderId}/status`, {
    headers: _authHeader(),
  });
  return data;
}

/**
 * Verify Midtrans webhook signature.
 * signature_key = SHA512(order_id + status_code + gross_amount + SERVER_KEY)
 *
 * @param {object} notification - raw webhook body from Midtrans
 * @returns {boolean}
 */
function verifyWebhookSignature(notification) {
  const { order_id, status_code, gross_amount, signature_key } = notification;
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`)
    .digest('hex');

  return expected === signature_key;
}

/**
 * Determine if a Midtrans notification means the payment succeeded.
 * Covers both one-time and recurring scenarios.
 *
 * @param {object} notification
 * @returns {boolean}
 */
function isPaymentSuccess(notification) {
  const { transaction_status, fraud_status } = notification;

  if (transaction_status === 'capture') {
    return fraud_status === 'accept';
  }
  if (transaction_status === 'settlement') {
    return true;
  }
  return false;
}

/**
 * Determine if a Midtrans notification means the payment failed/expired/cancelled.
 * @param {object} notification
 * @returns {boolean}
 */
function isPaymentFailed(notification) {
  return ['deny', 'cancel', 'expire', 'failure'].includes(notification.transaction_status);
}

module.exports = {
  createSnapTransaction,
  getTransactionStatus,
  verifyWebhookSignature,
  isPaymentSuccess,
  isPaymentFailed,
};
