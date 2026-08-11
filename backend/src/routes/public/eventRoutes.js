const express = require('express');
const eventController = require('../../controllers/eventController');

const router = express.Router();

// GET /api/v1/events
router.get('/', eventController.getActiveEvents);

module.exports = router;
