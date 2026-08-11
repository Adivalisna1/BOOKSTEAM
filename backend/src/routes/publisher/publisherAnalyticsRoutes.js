const express = require('express');
const publisherAnalyticsController = require('../../controllers/publisher/publisherAnalyticsController');

const router = express.Router();

// GET /api/v1/publisher/analytics
router.get('/', publisherAnalyticsController.getAnalytics);

module.exports = router;
