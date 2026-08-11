const searchService = require('../services/searchService');

/**
 * GET /api/v1/search?q=keyword
 * Full-text search across books.
 */
async function searchBooks(req, res, next) {
  try {
    const { q, genre, book_type, min_price, max_price, page, limit } = req.query;

    const result = await searchService.searchBooks({
      q,
      genre,
      book_type,
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });

    res.json({
      success: true,
      query: result.query,
      data: result.books,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchBooks };
