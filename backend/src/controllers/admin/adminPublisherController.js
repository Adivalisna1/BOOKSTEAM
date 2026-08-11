const adminPublisherService = require('../../services/admin/adminPublisherService');

/**
 * GET /api/v1/admin/publishers
 * Supports ?status=pending|approved|rejected
 */
async function listPublishers(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await adminPublisherService.listPublishers({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
    });
    res.json({ success: true, data: result.publishers, pagination: result.pagination });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/admin/publishers/:id
 */
async function getPublisherById(req, res, next) {
  try {
    const publisher = await adminPublisherService.getPublisherById(req.params.id);
    res.json({ success: true, data: publisher });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/publishers/:id/approve
 */
async function approvePublisher(req, res, next) {
  try {
    const result = await adminPublisherService.approvePublisher(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/publishers/:id/reject
 * Body: { reason }
 */
async function rejectPublisher(req, res, next) {
  try {
    const result = await adminPublisherService.rejectPublisher(req.params.id, req.body.reason);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { listPublishers, getPublisherById, approvePublisher, rejectPublisher };
