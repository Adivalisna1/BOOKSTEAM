const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Get paginated notifications for a user. */
async function getNotifications(userId, { page = 1, limit = 20, unread_only = false }) {
  const offset = (page - 1) * limit;
  const params = [userId];
  const conditions = ['user_id = ?'];

  if (unread_only) {
    conditions.push('is_read = 0');
  }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM notifications WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows: unreadRows } = await db.query(
    'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  const unread_count = parseInt(unreadRows[0].unread, 10);

  const { rows } = await db.query(
    `SELECT id, title, message, type, is_read, created_at
     FROM notifications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    notifications: rows,
    unread_count,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Mark a single notification as read. */
async function markAsRead(userId, notificationId) {
  const { rows } = await db.query(
    'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  if (rows.length === 0) throw new AppError('Notification not found', 404);

  await db.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );

  return { message: 'Notification marked as read' };
}

/** Mark all notifications as read. */
async function markAllAsRead(userId) {
  const { rows } = await db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [userId]
  );

  return { message: 'All notifications marked as read' };
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
