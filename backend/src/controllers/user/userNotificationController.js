const userNotificationService = require('../../services/user/userNotificationService');

/** GET /api/v1/user/notifications */
async function getNotifications(req, res, next) {
  try {
    const { page, limit, unread_only } = req.query;
    const result = await userNotificationService.getNotifications(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      unread_only: unread_only === 'true',
    });
    res.json({
      success: true,
      data: result.notifications,
      unread_count: result.unread_count,
      pagination: result.pagination,
    });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/user/notifications/read-all */
async function markAllAsRead(req, res, next) {
  try {
    const result = await userNotificationService.markAllAsRead(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/user/notifications/:id/read */
async function markAsRead(req, res, next) {
  try {
    const result = await userNotificationService.markAsRead(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
