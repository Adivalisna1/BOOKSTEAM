const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** List publisher applications with pagination and optional status filter. */
async function listPublishers({ page = 1, limit = 20, status }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('pp.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM publisher_profiles pp ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      pp.id, pp.display_name, pp.bio, pp.document_url,
      pp.status, pp.rejection_reason,
      pp.balance_pending, pp.balance_available,
      pp.approved_at, pp.created_at,
      u.id       AS user_id,
      u.email    AS user_email,
      u.username AS user_username
    FROM publisher_profiles pp
    JOIN users u ON pp.user_id = u.id
    ${whereClause}
    ORDER BY pp.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    publishers: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get single publisher profile. */
async function getPublisherById(publisherId) {
  const { rows } = await db.query(
    `SELECT
      pp.*,
      u.email AS user_email, u.username AS user_username, u.created_at AS user_since
    FROM publisher_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE pp.id = ?`,
    [publisherId]
  );
  if (rows.length === 0) throw new AppError('Publisher not found', 404);
  return rows[0];
}

/** Approve a publisher application → set status approved + update user role. */
async function approvePublisher(publisherId) {
  const { rows } = await db.query(
    "SELECT id, user_id, status FROM publisher_profiles WHERE id = ?",
    [publisherId]
  );
  if (rows.length === 0) throw new AppError('Publisher not found', 404);
  if (rows[0].status === 'approved') throw new AppError('Publisher is already approved', 400);

  const client = await db.getClient();
  try {
    await client.beginTransaction();

    await client.execute(
      "UPDATE publisher_profiles SET status = 'approved', approved_at = NOW(), updated_at = NOW() WHERE id = ?",
      [publisherId]
    );

    // Upgrade user role to publisher
    await client.execute(
      "UPDATE users SET role = 'publisher', updated_at = NOW() WHERE id = ?",
      [rows[0].user_id]
    );

    await client.commit();
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }

  return { message: 'Publisher approved successfully', publisher_id: publisherId };
}

/** Reject a publisher application with a reason. */
async function rejectPublisher(publisherId, reason) {
  if (!reason || reason.trim().length === 0) {
    throw new AppError('Rejection reason is required', 400);
  }

  const { rows } = await db.query(
    "SELECT id, status FROM publisher_profiles WHERE id = ?",
    [publisherId]
  );
  if (rows.length === 0) throw new AppError('Publisher not found', 404);
  if (rows[0].status === 'rejected') throw new AppError('Publisher is already rejected', 400);

  await db.query(
    "UPDATE publisher_profiles SET status = 'rejected', rejection_reason = ?, updated_at = NOW() WHERE id = ?",
    [reason.trim(), publisherId]
  );

  return { message: 'Publisher application rejected', publisher_id: publisherId };
}

module.exports = { listPublishers, getPublisherById, approvePublisher, rejectPublisher };
