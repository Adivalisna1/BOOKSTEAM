const webhookService = require('../../services/payment/webhookService');

/**
 * POST /api/v1/payment/webhook
 *
 * Midtrans sends a JSON notification body.
 * This endpoint must be PUBLIC (no JWT) — Midtrans calls it server-to-server.
 * Signature verification is done inside webhookService.
 */
async function handleWebhook(req, res, next) {
  try {
    const result = await webhookService.handleWebhook(req.body);
    // Always respond 200 — Midtrans retries if it gets anything else
    res.json({ success: true, ...result });
  } catch (err) {
    // If signature invalid (statusCode 400), still respond with 200
    // to prevent Midtrans from retrying a clearly bad request.
    // Log the error internally but don't expose details.
    console.error('[Webhook Error]', err.message);
    res.status(200).json({ success: false, message: 'Webhook processing failed' });
  }
}

module.exports = { handleWebhook };
