const friendService = require('../services/friendService');

/** GET /api/v1/friends */
async function listFriends(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await friendService.listFriends(req.user.id, {
      page:  parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      search,
    });
    res.json({ success: true, data: result.friends, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/friends/requests/pending */
async function listPendingRequests(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await friendService.listPendingRequests(req.user.id, {
      page:  parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result.requests, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/friends/requests/sent */
async function listSentRequests(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await friendService.listSentRequests(req.user.id, {
      page:  parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result.sent_requests, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** POST /api/v1/friends/request/:userId */
async function sendRequest(req, res, next) {
  try {
    const result = await friendService.sendRequest(req.user.id, req.params.userId);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/friends/request/:requestId/accept */
async function acceptRequest(req, res, next) {
  try {
    const result = await friendService.acceptRequest(req.user.id, req.params.requestId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/friends/request/:requestId/decline */
async function declineRequest(req, res, next) {
  try {
    const result = await friendService.declineRequest(req.user.id, req.params.requestId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/friends/request/:requestId */
async function cancelRequest(req, res, next) {
  try {
    const result = await friendService.cancelRequest(req.user.id, req.params.requestId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/friends/:userId */
async function removeFriend(req, res, next) {
  try {
    const result = await friendService.removeFriend(req.user.id, req.params.userId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** GET /api/v1/friends/status/:userId */
async function getFriendshipStatus(req, res, next) {
  try {
    const result = await friendService.getFriendshipStatus(req.user.id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
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
