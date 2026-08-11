const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Get full profile of the logged-in user. */
async function getProfile(userId) {
  const { rows } = await db.query(
    `SELECT
      id, email, username, role, exp_total, level,
      wallet_balance, avatar_url, is_verified, created_at
    FROM users WHERE id = ?`,
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

/**
 * Update profile fields: username, avatar_url.
 * Email and password changes are handled by Auth API.
 */
async function updateProfile(userId, { username, avatar_url }) {
  const setClauses = [];
  const params = [];

  if (username !== undefined) {
    // Check uniqueness
    const { rows } = await db.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );
    if (rows.length > 0) throw new AppError('Username is already taken', 409);
    setClauses.push('username = ?');
    params.push(username);
  }

  if (avatar_url !== undefined) {
    setClauses.push('avatar_url = ?');
    params.push(avatar_url);
  }

  if (setClauses.length === 0) throw new AppError('No valid fields to update', 400);

  setClauses.push('updated_at = NOW()');
  params.push(userId);

  await db.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
    params
  );

  return getProfile(userId);
}

/** Get paginated EXP event history for the user. */
async function getExpHistory(userId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM exp_events WHERE user_id = ?',
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT id, exp_amount, source, description, reference_id, created_at
     FROM exp_events
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    exp_history: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { getProfile, updateProfile, getExpHistory };
