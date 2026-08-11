const express = require('express');
const { param, query } = require('express-validator');
const friendController = require('../controllers/friendController');
const { validateRequest } = require('../middlewares/validateRequest');

const router = express.Router();

const userIdParam = [
  param('userId').isUUID().withMessage('userId must be a valid UUID'),
];
const requestIdParam = [
  param('requestId').isUUID().withMessage('requestId must be a valid UUID'),
];
const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

// ------------------------------------------------------------------
// GET /api/v1/friends
// List accepted friends. Supports ?search=keyword
// ------------------------------------------------------------------
router.get(
  '/',
  [
    ...paginationQuery,
    query('search').optional().isString().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  friendController.listFriends
);

// ------------------------------------------------------------------
// GET /api/v1/friends/requests/pending
// Friend requests received, waiting for action
// NOTE: must be before /:userId to avoid route collision
// ------------------------------------------------------------------
router.get(
  '/requests/pending',
  paginationQuery,
  validateRequest,
  friendController.listPendingRequests
);

// ------------------------------------------------------------------
// GET /api/v1/friends/requests/sent
// Friend requests sent by the user that are still pending
// ------------------------------------------------------------------
router.get(
  '/requests/sent',
  paginationQuery,
  validateRequest,
  friendController.listSentRequests
);

// ------------------------------------------------------------------
// GET /api/v1/friends/status/:userId
// Check friendship status with a specific user
// ------------------------------------------------------------------
router.get(
  '/status/:userId',
  userIdParam,
  validateRequest,
  friendController.getFriendshipStatus
);

// ------------------------------------------------------------------
// POST /api/v1/friends/request/:userId
// Send a friend request
// ------------------------------------------------------------------
router.post(
  '/request/:userId',
  userIdParam,
  validateRequest,
  friendController.sendRequest
);

// ------------------------------------------------------------------
// PATCH /api/v1/friends/request/:requestId/accept
// ------------------------------------------------------------------
router.patch(
  '/request/:requestId/accept',
  requestIdParam,
  validateRequest,
  friendController.acceptRequest
);

// ------------------------------------------------------------------
// PATCH /api/v1/friends/request/:requestId/decline
// ------------------------------------------------------------------
router.patch(
  '/request/:requestId/decline',
  requestIdParam,
  validateRequest,
  friendController.declineRequest
);

// ------------------------------------------------------------------
// DELETE /api/v1/friends/request/:requestId
// Cancel a sent pending request
// ------------------------------------------------------------------
router.delete(
  '/request/:requestId',
  requestIdParam,
  validateRequest,
  friendController.cancelRequest
);

// ------------------------------------------------------------------
// DELETE /api/v1/friends/:userId
// Remove an existing friend
// ------------------------------------------------------------------
router.delete(
  '/:userId',
  userIdParam,
  validateRequest,
  friendController.removeFriend
);

module.exports = router;
