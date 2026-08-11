const crypto   = require('crypto');
const db       = require('../../config/database');
const midtrans = require('../../config/midtransHelper');

/**
 * Handle Midtrans webhook notification.
 * Determines whether it's a checkout (BS-BOOK-) or topup (BS-TOPUP-) order
 * and delegates to the appropriate handler.
 */
async function handleWebhook(notification) {
  // 1. Verify signature
  if (!midtrans.verifyWebhookSignature(notification)) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 400;
    throw err;
  }

  const { order_id } = notification;

  if (order_id && order_id.startsWith('BS-BOOK-')) {
    return _handleCheckoutWebhook(notification);
  }

  if (order_id && order_id.startsWith('BS-TOPUP-')) {
    return _handleTopupWebhook(notification);
  }

  // Unknown order prefix — ignore silently
  return { message: 'Unknown order type, ignored' };
}

// =============================================
// Private: checkout webhook
// =============================================
async function _handleCheckoutWebhook(notification) {
  const { order_id, transaction_id: midtransTransactionId } = notification;

  const { rows } = await db.query(
    `SELECT id, user_id, book_id, amount, return_window_expires_at, status
     FROM transactions WHERE midtrans_order_id = ?`,
    [order_id]
  );

  if (rows.length === 0) return { message: 'Transaction not found, ignored' };

  const tx = rows[0];

  // Already processed — idempotent
  if (tx.status !== 'pending') return { message: 'Already processed' };

  // ── Payment success ──────────────────────────────────────────────────
  if (midtrans.isPaymentSuccess(notification)) {
    const { rows: bookRows } = await db.query(
      'SELECT publisher_id, book_type, title FROM books WHERE id = ?',
      [tx.book_id]
    );
    if (bookRows.length === 0) return { message: 'Book not found, ignored' };

    const { publisher_id, title } = bookRows[0];
    const publisherShare = parseFloat((tx.amount * 65 / 100).toFixed(2));
    const platformShare  = parseFloat((tx.amount * 35 / 100).toFixed(2));
    const rsId  = crypto.randomUUID();
    const libId = crypto.randomUUID();
    const expId = crypto.randomUUID();

    const client = await db.getClient();
    try {
      await client.beginTransaction();

      // Mark transaction completed
      await client.execute(
        `UPDATE transactions
         SET status = 'completed',
             midtrans_transaction_id = ?,
             completed_at = NOW(),
             updated_at   = NOW()
         WHERE id = ?`,
        [midtransTransactionId, tx.id]
      );

      // Create revenue split (holding)
      await client.execute(
        `INSERT INTO revenue_splits
          (id, transaction_id, publisher_id, total_amount,
           publisher_share, platform_share, publisher_percent, status)
         VALUES (?, ?, ?, ?, ?, ?, 65.00, 'holding')`,
        [rsId, tx.id, publisher_id, tx.amount, publisherShare, platformShare]
      );

      // Add to library
      await client.execute(
        `INSERT INTO libraries (id, user_id, book_id, transaction_id)
         VALUES (?, ?, ?, ?)`,
        [libId, tx.user_id, tx.book_id, tx.id]
      );

      // Increment sales count
      await client.execute(
        'UPDATE books SET sales_count = sales_count + 1, updated_at = NOW() WHERE id = ?',
        [tx.book_id]
      );

      // EXP +50
      await client.execute(
        `INSERT INTO exp_events
          (id, user_id, exp_amount, source, reference_id, description)
         VALUES (?, ?, 50, 'purchase', ?, ?)`,
        [expId, tx.user_id, tx.id, `Purchased: ${title}`]
      );
      await client.execute(
        `UPDATE users
         SET exp_total  = exp_total + 50,
             level      = FLOOR(1 + SQRT(exp_total + 50) / 10),
             updated_at = NOW()
         WHERE id = ?`,
        [tx.user_id]
      );

      await client.commit();
    } catch (err) {
      await client.rollback();
      throw err;
    } finally {
      client.release();
    }

    return { message: 'Checkout payment confirmed', transaction_id: tx.id };
  }

  // ── Payment failed / expired / cancelled ────────────────────────────
  if (midtrans.isPaymentFailed(notification)) {
    await db.query(
      `UPDATE transactions
       SET status = 'refunded', updated_at = NOW()
       WHERE id = ?`,
      [tx.id]
    );
    return { message: 'Checkout payment failed, transaction cancelled' };
  }

  return { message: 'Notification received, no action taken' };
}

// =============================================
// Private: topup webhook
// =============================================
async function _handleTopupWebhook(notification) {
  const { order_id, transaction_id: midtransTransactionId } = notification;

  const { rows } = await db.query(
    'SELECT id, user_id, amount, status FROM top_up_history WHERE midtrans_order_id = ?',
    [order_id]
  );

  if (rows.length === 0) return { message: 'Top-up not found, ignored' };

  const topup = rows[0];

  if (topup.status !== 'pending') return { message: 'Already processed' };

  // ── Payment success ──────────────────────────────────────────────────
  if (midtrans.isPaymentSuccess(notification)) {
    const client = await db.getClient();
    try {
      await client.beginTransaction();

      await client.execute(
        `UPDATE top_up_history
         SET status = 'success',
             midtrans_transaction_id = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [midtransTransactionId, topup.id]
      );

      await client.execute(
        `UPDATE users
         SET wallet_balance = wallet_balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [topup.amount, topup.user_id]
      );

      await client.commit();
    } catch (err) {
      await client.rollback();
      throw err;
    } finally {
      client.release();
    }

    return { message: 'Top-up confirmed, wallet updated', topup_id: topup.id };
  }

  // ── Failed ───────────────────────────────────────────────────────────
  if (midtrans.isPaymentFailed(notification)) {
    await db.query(
      "UPDATE top_up_history SET status = 'failed', updated_at = NOW() WHERE id = ?",
      [topup.id]
    );
    return { message: 'Top-up payment failed' };
  }

  return { message: 'Notification received, no action taken' };
}

module.exports = { handleWebhook };
