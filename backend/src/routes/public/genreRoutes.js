const express = require('express');
const genreController = require('../../controllers/genreController');

const router = express.Router();

// GET /api/v1/genres
router.get('/', genreController.listGenres);

module.exports = router;
