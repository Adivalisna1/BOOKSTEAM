const db = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

/** List all accepted friends of a user. */
async function listFriends(userId, { page = 1, limit = 20, search }) {
  const offset = (page - 1) * limit;
  const params = [userId, userId];
  const conditions = [
    "(fr.sender_id = ? OR fr.receiver_id = ?)",
    "fr.status = 'accepted'",
  ];

  if (search) {
    conditions.push('(u.username LIKE ? OR u.email LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total
     FROM friend_requests fr
     JOIN users u ON u.id = CASE WHEN fr.sender_id = ? THEN fr.receiver_id ELSE fr.sender_id END
     WHERE ${whereClause}`,
    [userId, ...params]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      fr.id AS friendship_id,
      fr.created_at AS friends_since,
      u.id       AS user_id,
      u.username,
      u.avatar_url,
      u.level
    FROM friend_requests fr
    JOIN users u ON u.id = CASE WHEN fr.sender_id = ? THEN fr.receiver_id ELSE fr.sender_id END
    WHERE ${whereClause}
    ORDER BY u.username ASC
    LIMIT ? OFFSET ?`,
    [userId, ...params, limit, offset]
  );

  return {
    friends: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** List pending friend requests received by the user. */
async function listPendingRequests(userId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await db.query(
    "SELECT COUNT(*) AS total FROM friend_requests WHERE receiver_id = ? AND status = 'pending'",
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      fr.id AS request_id,
      fr.created_at AS requested_at,
      u.id       AS sender_id,
      u.username AS sender_username,
      u.avatar_url AS sender_avatar,
      u.level    AS sender_level
    FROM friend_requests fr
    JOIN users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    requests: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** List sent pending requests by the user. */
async function listSentRequests(userId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await db.query(
    "SELECT COUNT(*) AS total FROM friend_requests WHERE sender_id = ? AND status = 'pending'",
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      fr.id AS request_id,
      fr.created_at AS sent_at,
      u.id       AS receiver_id,
      u.username AS receiver_username,
      u.avatar_url AS receiver_avatar,
      u.level    AS receiver_level
    FROM friend_requests fr
    JOIN users u ON fr.receiver_id = u.id
    WHERE fr.sender_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    sent_requests: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Send a friend request to another user. */
async function sendRequest(senderId, receiverId) {
  if (senderId === receiverId) {
    throw new AppError('You cannot send a friend request to yourself', 400);
  }

  // Check receiver exists
  const { rows: userRows } = await db.query(
    'SELECT id, is_banned FROM users WHERE id = ?',
    [receiverId]
  );
  if (userRows.length === 0) throw new AppError('User not found', 404);
  if (userRows[0].is_banned)  throw new AppError('User not found', 404); // hide banned users

  // Check for any existing relationship (pending, accepted, declined)
  const { rows: existing } = await db.query(
    `SELECT id, status, sender_id
     FROM friend_requests
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)`,
    [senderId, receiverId, receiverId, senderId]
  );

  if (existing.length > 0) {
    const rel = existing[0];
    if (rel.status === 'accepted') throw new AppError('You are already friends', 409);
    if (rel.status === 'pending' && rel.sender_id === senderId) {
      throw new AppError('Friend request already sent', 409);
    }
    if (rel.status === 'pending' && rel.sender_id === receiverId) {
      throw new AppError('This user has already sent you a friend request. Accept it instead.', 409);
    }
    // If declined, allow re-sending — delete old record first
    if (rel.status === 'declined') {
      await db.query('DELETE FROM friend_requests WHERE id = ?', [rel.id]);
    }
  }

  const id = require('crypto').randomUUID();
  await db.query(
    "INSERT INTO friend_requests (id, sender_id, receiver_id, status) VALUES (?, ?, ?, 'pending')",
    [id, senderId, receiverId]
  );

  return { message: 'Friend request sent', request_id: id };
}

/** Accept a pending friend request. */
async function acceptRequest(userId, requestId) {
  const { rows } = await db.query(
    'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = ?',
    [requestId]
  );

  if (rows.length === 0) throw new AppError('Friend request not found', 404);
  if (rows[0].receiver_id !== userId) throw new AppError('You cannot accept this request', 403);
  if (rows[0].status !== 'pending')   throw new AppError('Request is no longer pending', 400);

  await db.query(
    "UPDATE friend_requests SET status = 'accepted', updated_at = NOW() WHERE id = ?",
    [requestId]
  );

  return { message: 'Friend request accepted', friend_id: rows[0].sender_id };
}

/** Decline a pending friend request. */
async function declineRequest(userId, requestId) {
  const { rows } = await db.query(
    'SELECT id, receiver_id, status FROM friend_requests WHERE id = ?',
    [requestId]
  );

  if (rows.length === 0) throw new AppError('Friend request not found', 404);
  if (rows[0].receiver_id !== userId) throw new AppError('You cannot decline this request', 403);
  if (rows[0].status !== 'pending')   throw new AppError('Request is no longer pending', 400);

  await db.query(
    "UPDATE friend_requests SET status = 'declined', updated_at = NOW() WHERE id = ?",
    [requestId]
  );

  return { message: 'Friend request declined' };
}

/** Cancel a sent friend request (by the sender). */
async function cancelRequest(userId, requestId) {
  const { rows } = await db.query(
    'SELECT id, sender_id, status FROM friend_requests WHERE id = ?',
    [requestId]
  );

  if (rows.length === 0) throw new AppError('Friend request not found', 404);
  if (rows[0].sender_id !== userId) throw new AppError('You cannot cancel this request', 403);
  if (rows[0].status !== 'pending') throw new AppError('Request is no longer pending', 400);

  await db.query('DELETE FROM friend_requests WHERE id = ?', [requestId]);

  return { message: 'Friend request cancelled' };
}

/** Remove an existing friend (works both directions). */
async function removeFriend(userId, friendId) {
  const { rows } = await db.query(
    `SELECT id FROM friend_requests
     WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND status = 'accepted'`,
    [userId, friendId, friendId, userId]
  );

  if (rows.length === 0) throw new AppError('Friend not found', 404);

  await db.query('DELETE FROM friend_requests WHERE id = ?', [rows[0].id]);

  return { message: 'Friend removed successfully' };
}

/** Check friendship status between two users. */
async function getFriendshipStatus(userId, targetId) {
  if (userId === targetId) return { status: 'self' };

  const { rows } = await db.query(
    `SELECT id, status, sender_id, receiver_id
     FROM friend_requests
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)`,
    [userId, targetId, targetId, userId]
  );

  if (rows.length === 0) return { status: 'none' };

  const rel = rows[0];
  return {
    status:     rel.status,
    request_id: rel.id,
    initiated_by_me: rel.sender_id === userId,
  };
}

module.exports = {
  listFriends,
  listPendingRequests,
  listSentRequests,
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  removeFriend,
  getFriendshipStatus,
};
