const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

async function _getPublisherProfile(userId) {
  const { rows } = await db.query(
    "SELECT id, balance_pending, balance_available FROM publisher_profiles WHERE user_id = ? AND status = 'approved'",
    [userId]
  );
  if (rows.length === 0) throw new AppError('Approved publisher profile not found', 404);
  return rows[0];
}

/** Get balance summary. */
async function getBalance(userId) {
  const profile = await _getPublisherProfile(userId);

  const { rows: withdrawalRows } = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS total_withdrawn
     FROM withdrawal_requests
     WHERE publisher_id = ? AND status = 'completed'`,
    [profile.id]
  );

  return {
    balance_available: parseFloat(profile.balance_available),
    balance_pending:   parseFloat(profile.balance_pending),
    total_withdrawn:   parseFloat(withdrawalRows[0].total_withdrawn),
  };
}

/** Paginated list of revenue splits (released only = available income). */
async function getRevenueHistory(userId, { page = 1, limit = 20, status }) {
  const profile = await _getPublisherProfile(userId);
  const offset = (page - 1) * limit;
  const params = [profile.id];
  const conditions = ['rs.publisher_id = ?'];

  if (status) {
    conditions.push('rs.status = ?');
    params.push(status);
  }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM revenue_splits rs WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      rs.id, rs.total_amount, rs.publisher_share, rs.platform_share,
      rs.publisher_percent, rs.status, rs.release_at,
      t.purchase_at, t.payment_method,
      b.id AS book_id, b.title AS book_title
    FROM revenue_splits rs
    JOIN transactions t ON rs.transaction_id = t.id
    JOIN books b ON t.book_id = b.id
    WHERE ${whereClause}
    ORDER BY t.purchase_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    revenue_history: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Request a withdrawal. Amount must not exceed balance_available. */
async function requestWithdrawal(userId, { amount, bank_name, account_number }) {
  const profile = await _getPublisherProfile(userId);

  if (amount <= 0) throw new AppError('Withdrawal amount must be greater than 0', 400);
  if (amount > profile.balance_available) {
    throw new AppError(
      `Insufficient balance. Available: ${profile.balance_available}`,
      400
    );
  }

  // Minimum withdrawal: Rp 50.000
  const MIN_WITHDRAWAL = 50000;
  if (amount < MIN_WITHDRAWAL) {
    throw new AppError(`Minimum withdrawal amount is Rp ${MIN_WITHDRAWAL.toLocaleString('id-ID')}`, 400);
  }

  const id = require('crypto').randomUUID();
  const client = await db.getClient();

  try {
    await client.beginTransaction();

    await client.execute(
      `INSERT INTO withdrawal_requests
        (id, publisher_id, amount, bank_name, account_number, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, profile.id, amount, bank_name, account_number]
    );

    // Deduct from available balance
    await client.execute(
      `UPDATE publisher_profiles
       SET balance_available = balance_available - ?, updated_at = NOW()
       WHERE id = ?`,
      [amount, profile.id]
    );

    await client.commit();
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }

  return {
    message: 'Withdrawal request submitted. Processing within 1-3 business days.',
    withdrawal_id: id,
    amount,
  };
}

/** Paginated withdrawal history. */
async function getWithdrawalHistory(userId, { page = 1, limit = 20, status }) {
  const profile = await _getPublisherProfile(userId);
  const offset = (page - 1) * limit;
  const params = [profile.id];
  const conditions = ['publisher_id = ?'];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM withdrawal_requests WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT id, amount, bank_name, account_number, status, requested_at, completed_at
     FROM withdrawal_requests
     WHERE ${whereClause}
     ORDER BY requested_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    withdrawals: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { getBalance, getRevenueHistory, requestWithdrawal, getWithdrawalHistory };
