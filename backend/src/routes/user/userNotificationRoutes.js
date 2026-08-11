const express = require('express');
const { param, query } = require('express-validator');
const userNotificationController = require('../../controllers/user/userNotificationController');
const { validateRequest } = require('../../middlewares/validateRequest');

const router = express.Router();

// GET /api/v1/user/notifications
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('unread_only').optional().isBoolean(),
  ],
  validateRequest,
  userNotificationController.getNotifications
);

// PATCH /api/v1/user/notifications/read-all  — must be before /:id/read
router.patch('/read-all', userNotificationController.markAllAsRead);

// PATCH /api/v1/user/notifications/:id/read
router.patch(
  '/:id/read',
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  userNotificationController.markAsRead
);

module.exports = router;
