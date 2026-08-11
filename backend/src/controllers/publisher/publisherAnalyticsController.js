const publisherAnalyticsService = require('../../services/publisher/publisherAnalyticsService');

/** GET /api/v1/publisher/analytics */
async function getAnalytics(req, res, next) {
  try {
    const data = await publisherAnalyticsService.getAnalytics(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { getAnalytics };
