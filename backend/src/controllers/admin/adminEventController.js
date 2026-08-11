const adminEventService = require('../../services/admin/adminEventService');

/**
 * GET /api/v1/admin/events
 * List all events. Supports ?is_active=true|false
 */
async function listEvents(req, res, next) {
  try {
    const { page, limit, is_active } = req.query;
    const result = await adminEventService.listEvents({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
    });
    res.json({ success: true, data: result.events, pagination: result.pagination });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/admin/events/:id
 */
async function getEventById(req, res, next) {
  try {
    const event = await adminEventService.getEventById(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/admin/events
 * Body: { title, description?, banner_url?, link_url?, start_date, end_date?, is_active? }
 */
async function createEvent(req, res, next) {
  try {
    const { title, description, banner_url, link_url, start_date, end_date, is_active } = req.body;
    const event = await adminEventService.createEvent({
      adminId: req.user.id,
      title,
      description,
      banner_url,
      link_url,
      start_date,
      end_date,
      is_active: is_active !== undefined ? is_active : true,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
}

/**
 * PUT /api/v1/admin/events/:id
 */
async function updateEvent(req, res, next) {
  try {
    const event = await adminEventService.updateEvent(req.params.id, req.body);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

/**
 * DELETE /api/v1/admin/events/:id
 */
async function deleteEvent(req, res, next) {
  try {
    const result = await adminEventService.deleteEvent(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
