const eventService = require('../services/eventService');

/**
 * GET /api/v1/events
 * Get active homepage events/banners.
 */
async function getActiveEvents(req, res, next) {
  try {
    const events = await eventService.getActiveEvents();

    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getActiveEvents };
