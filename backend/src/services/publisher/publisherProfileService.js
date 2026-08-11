const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Get publisher profile by user ID. */
async function getProfile(userId) {
  const { rows } = await db.query(
    `SELECT
      pp.id, pp.display_name, pp.bio, pp.document_url,
      pp.status, pp.rejection_reason,
      pp.balance_pending, pp.balance_available,
      pp.approved_at, pp.created_at, pp.updated_at,
      u.email, u.username, u.avatar_url, u.is_verified
    FROM publisher_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE pp.user_id = ?`,
    [userId]
  );
  if (rows.length === 0) throw new AppError('Publisher profile not found', 404);
  return rows[0];
}

/**
 * Apply to become a publisher.
 * Only users with role='user' who don't already have a profile can apply.
 */
async function applyAsPublisher(userId, { display_name, bio, document_url }) {
  // Check if user already applied
  const { rows: existing } = await db.query(
    'SELECT id, status FROM publisher_profiles WHERE user_id = ?',
    [userId]
  );
  if (existing.length > 0) {
    const status = existing[0].status;
    if (status === 'pending') throw new AppError('Your application is already under review', 409);
    if (status === 'approved') throw new AppError('You are already an approved publisher', 409);
    if (status === 'rejected') throw new AppError('Your application was rejected. Contact support to re-apply', 403);
  }

  const id = require('crypto').randomUUID();
  await db.query(
    `INSERT INTO publisher_profiles (id, user_id, display_name, bio, document_url, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [id, userId, display_name, bio || null, document_url || null]
  );

  return {
    message: 'Publisher application submitted. Pending admin review.',
    publisher_id: id,
  };
}

/** Update publisher profile fields. */
async function updateProfile(userId, { display_name, bio, document_url }) {
  const { rows } = await db.query(
    "SELECT id, status FROM publisher_profiles WHERE user_id = ?",
    [userId]
  );
  if (rows.length === 0) throw new AppError('Publisher profile not found', 404);
  if (rows[0].status !== 'approved') throw new AppError('Only approved publishers can update their profile', 403);

  const setClauses = ['updated_at = NOW()'];
  const params = [];

  if (display_name !== undefined) { setClauses.push('display_name = ?'); params.push(display_name); }
  if (bio !== undefined)          { setClauses.push('bio = ?');          params.push(bio); }
  if (document_url !== undefined) { setClauses.push('document_url = ?'); params.push(document_url); }

  if (setClauses.length === 1) throw new AppError('No valid fields to update', 400);

  params.push(userId);
  await db.query(
    `UPDATE publisher_profiles SET ${setClauses.join(', ')} WHERE user_id = ?`,
    params
  );

  return getProfile(userId);
}

module.exports = { getProfile, applyAsPublisher, updateProfile };
