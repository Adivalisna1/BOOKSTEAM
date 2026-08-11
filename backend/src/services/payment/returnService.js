const crypto = require('crypto');
const db     = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

const MAX_READ_PERCENT = 30.00; // max 30% halaman dibaca untuk eligible return

/**
 * Check if a transaction is eligible for return.
 * Returns eligibility info without modifying anything.
 */
async function checkReturnEligibility(userId, transactionId) {
  const { rows } = await db.query(
    `SELECT
      t.id, t.status, t.amount, t.return_window_expires_at, t.purchase_at,
      b.id AS book_id, b.title, b.book_type,
      l.progress_percent
     FROM transactions t
     JOIN books b ON t.book_id = b.id
     JOIN libraries l ON l.transaction_id = t.id AND l.user_id = ?
     WHERE t.id = ? AND t.user_id = ?`,
    [userId, transactionId, userId]
  );

  if (rows.length === 0) throw new AppError('Transaction not found', 404);

  const tx = rows[0];

  if (tx.status === 'refunded') {
    return { eligible: false, reason: 'This transaction has already been refunded' };
  }
  if (tx.status !== 'completed') {
    return { eligible: false, reason: 'Transaction is not yet completed' };
  }

  const now         = new Date();
  const windowExpiry = new Date(tx.return_window_expires_at);
  const withinWindow = now <= windowExpiry;
  const withinRead   = parseFloat(tx.progress_percent) <= MAX_READ_PERCENT;

  if (!withinWindow) {
    return {
      eligible:  false,
      reason:    `Return window expired on ${windowExpiry.toISOString()}`,
      book_type: tx.book_type,
      progress_percent: tx.progress_percent,
    };
  }

  if (!withinRead) {
    return {
      eligible:  false,
      reason:    `Reading progress (${tx.progress_percent}%) exceeds the ${MAX_READ_PERCENT}% limit`,
      book_type: tx.book_type,
      progress_percent: tx.progress_percent,
    };
  }

  return {
    eligible:                true,
    transaction_id:          tx.id,
    book_title:              tx.title,
    amount:                  tx.amount,
    return_window_expires_at: tx.return_window_expires_at,
    progress_percent:        tx.progress_percent,
  };
}

/**
 * Process a return:
 * 1. Validate eligibility
 * 2. Revoke library access
 * 3. Refund amount to wallet
 * 4. Mark revenue split as refunded (cancel publisher share)
 * 5. Mark transaction as refunded
 * 6. Deduct EXP -50
 * 7. Create refund_request record
 */
async function processReturn(userId, transactionId, reason) {
  const eligibility = await checkReturnEligibility(userId, transactionId);
  if (!eligibility.eligible) {
    throw new AppError(eligibility.reason, 400);
  }

  const { rows: txRows } = await db.query(
    'SELECT id, user_id, book_id, amount FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  if (txRows.length === 0) throw new AppError('Transaction not found', 404);
  const tx = txRows[0];

  const refundId = crypto.randomUUID();
  const client   = await db.getClient();

  try {
    await client.beginTransaction();

    // 1. Remove from library
    await client.execute(
      'DELETE FROM libraries WHERE transaction_id = ? AND user_id = ?',
      [transactionId, userId]
    );

    // 2. Refund to wallet
    await client.execute(
      'UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = NOW() WHERE id = ?',
      [tx.amount, userId]
    );

    // 3. Mark revenue split as refunded + zero out publisher balance contribution
    await client.execute(
      "UPDATE revenue_splits SET status = 'refunded', updated_at = NOW() WHERE transaction_id = ?",
      [transactionId]
    );

    // 4. Mark transaction as refunded
    await client.execute(
      "UPDATE transactions SET status = 'refunded', updated_at = NOW() WHERE id = ?",
      [transactionId]
    );

    // 5. Decrement sales count
    await client.execute(
      'UPDATE books SET sales_count = GREATEST(sales_count - 1, 0), updated_at = NOW() WHERE id = ?',
      [tx.book_id]
    );

    // 6. EXP deduction -50
    const expId = crypto.randomUUID();
    await client.execute(
      `INSERT INTO exp_events (id, user_id, exp_amount, source, reference_id, description)
       VALUES (?, ?, -50, 'return_deduct', ?, 'Return deduction')`,
      [expId, userId, transactionId]
    );
    await client.execute(
      `UPDATE users
       SET exp_total = GREATEST(exp_total - 50, 0),
           level     = GREATEST(FLOOR(1 + SQRT(GREATEST(exp_total - 50, 0)) / 10), 1),
           updated_at = NOW()
       WHERE id = ?`,
      [userId]
    );

    // 7. Create refund request record (auto-approved for wallet payments)
    await client.execute(
      `INSERT INTO refund_requests
        (id, transaction_id, user_id, status, reason, processed_at)
       VALUES (?, ?, ?, 'approved', ?, NOW())`,
      [refundId, transactionId, userId, reason || 'User requested return']
    );

    await client.commit();
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }

  return {
    message:        'Return processed. Refund has been added to your wallet.',
    refund_id:      refundId,
    refunded_amount: tx.amount,
    transaction_id: transactionId,
  };
}

module.exports = { checkReturnEligibility, processReturn };
