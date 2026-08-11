const bookService = require('../services/bookService');

/**
 * GET /api/v1/books
 * List all approved books with pagination, filtering, and sorting.
 */
async function listBooks(req, res, next) {
  try {
    const {
      page, limit, genre, book_type,
      min_price, max_price, sort_by, order, tag,
    } = req.query;

    const result = await bookService.listBooks({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50), // max 50 per page
      genre,
      book_type,
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      sort_by,
      order,
      tag,
    });

    res.json({
      success: true,
      data: result.books,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/books/featured
 * Get featured books for homepage hero section.
 */
async function getFeaturedBooks(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 20);
    const books = await bookService.getFeaturedBooks(limit);

    res.json({
      success: true,
      data: books,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/books/new-releases
 * Get the newest released books.
 */
async function getNewReleases(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const books = await bookService.getNewReleases(limit);

    res.json({
      success: true,
      data: books,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/books/top-rated
 * Get highest rated books.
 */
async function getTopRatedBooks(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const books = await bookService.getTopRatedBooks(limit);

    res.json({
      success: true,
      data: books,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/books/:id
 * Get full details of a single book.
 */
async function getBookById(req, res, next) {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(id);

    res.json({
      success: true,
      data: book,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/books/:id/reviews
 * Get paginated reviews for a specific book.
 */
async function getBookReviews(req, res, next) {
  try {
    const { id } = req.params;
    const { page, limit, sort_by } = req.query;

    const result = await bookService.getBookReviews(id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 10, 50),
      sort_by,
    });

    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBooks,
  getFeaturedBooks,
  getNewReleases,
  getTopRatedBooks,
  getBookById,
  getBookReviews,
};
