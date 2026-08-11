const genreService = require('../services/genreService');

/**
 * GET /api/v1/genres
 * List all genres with book counts.
 */
async function listGenres(req, res, next) {
  try {
    const genres = await genreService.listGenres();

    res.json({
      success: true,
      data: genres,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listGenres };
