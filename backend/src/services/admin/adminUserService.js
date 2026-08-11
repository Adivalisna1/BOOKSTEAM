const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** List all users with pagination and optional filters. */
async function listUsers({ page = 1, limit = 20, role, is_banned, search }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (is_banned !== undefined) {
    conditions.push('is_banned = ?');
    params.push(is_banned ? 1 : 0);
  }
  if (search) {
    conditions.push('(username LIKE ? OR email LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      id, email, username, role, exp_total, level,
      wallet_balance, is_verified, is_banned,
      created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    users: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get single user detail by ID. */
async function getUserById(userId) {
  const { rows } = await db.query(
    `SELECT
      id, email, username, role, exp_total, level,
      wallet_balance, avatar_url, is_verified, is_banned,
      created_at, updated_at
    FROM users WHERE id = ?`,
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

/** Ban a user. */
async function banUser(userId, adminId) {
  const { rows } = await db.query("SELECT id, role, is_banned FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) throw new AppError('User not found', 404);
  if (rows[0].role === 'admin') throw new AppError('Cannot ban an admin account', 403);
  if (rows[0].is_banned) throw new AppError('User is already banned', 400);

  await db.query(
    "UPDATE users SET is_banned = 1, updated_at = NOW() WHERE id = ?",
    [userId]
  );

  return { message: 'User banned successfully', user_id: userId };
}

/** Unban a user. */
async function unbanUser(userId) {
  const { rows } = await db.query("SELECT id, is_banned FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) throw new AppError('User not found', 404);
  if (!rows[0].is_banned) throw new AppError('User is not banned', 400);

  await db.query(
    "UPDATE users SET is_banned = 0, updated_at = NOW() WHERE id = ?",
    [userId]
  );

  return { message: 'User unbanned successfully', user_id: userId };
}

module.exports = { listUsers, getUserById, banUser, unbanUser };
