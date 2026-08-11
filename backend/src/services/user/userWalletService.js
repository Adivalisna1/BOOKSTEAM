const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Get wallet balance + summary stats. */
async function getWallet(userId) {
  const { rows } = await db.query(
    'SELECT id, wallet_balance FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);

  // Top-up total (success only)
  const { rows: topupRows } = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS total_topup
     FROM top_up_history
     WHERE user_id = ? AND status = 'success'`,
    [userId]
  );

  // Total spent
  const { rows: spentRows } = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS total_spent
     FROM transactions
     WHERE user_id = ? AND status = 'completed' AND payment_method = 'wallet'`,
    [userId]
  );

  return {
    wallet_balance: rows[0].wallet_balance,
    total_topup: parseFloat(topupRows[0].total_topup),
    total_spent: parseFloat(spentRows[0].total_spent),
  };
}

/** Paginated top-up history. */
async function getTopUpHistory(userId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM top_up_history WHERE user_id = ?',
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT id, amount, payment_method, external_transaction_id, status, created_at
     FROM top_up_history
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    topup_history: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Paginated transaction history. */
async function getTransactions(userId, { page = 1, limit = 20, status }) {
  const offset = (page - 1) * limit;
  const params = [userId];
  const conditions = ['t.user_id = ?'];

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM transactions t WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      t.id, t.amount, t.payment_method, t.status,
      t.purchase_at, t.return_window_expires_at, t.completed_at,
      b.id    AS book_id,
      b.title AS book_title,
      b.cover_url
    FROM transactions t
    JOIN books b ON t.book_id = b.id
    WHERE ${whereClause}
    ORDER BY t.purchase_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    transactions: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get single transaction detail. */
async function getTransactionById(userId, transactionId) {
  const { rows } = await db.query(
    `SELECT
      t.*,
      b.title AS book_title, b.cover_url, b.book_type, b.genre,
      pp.display_name AS publisher_name
    FROM transactions t
    JOIN books b ON t.book_id = b.id
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE t.id = ? AND t.user_id = ?`,
    [transactionId, userId]
  );
  if (rows.length === 0) throw new AppError('Transaction not found', 404);
  return rows[0];
}

module.exports = { getWallet, getTopUpHistory, getTransactions, getTransactionById };
