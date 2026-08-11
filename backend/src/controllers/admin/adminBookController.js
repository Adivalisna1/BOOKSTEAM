const adminBookService = require('../../services/admin/adminBookService');

/**
 * GET /api/v1/admin/books
 * List all books (any status). Supports ?status=pending|approved|rejected|takedown
 */
async function listBooks(req, res, next) {
  try {
    const { page, limit, status, book_type, genre } = req.query;
    const result = await adminBookService.listBooks({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
      book_type,
      genre,
    });
    res.json({ success: true, data: result.books, pagination: result.pagination });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/admin/books/:id
 */
async function getBookById(req, res, next) {
  try {
    const book = await adminBookService.getBookById(req.params.id);
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/books/:id/approve
 */
async function approveBook(req, res, next) {
  try {
    const result = await adminBookService.approveBook(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/books/:id/reject
 * Body: { reason }
 */
async function rejectBook(req, res, next) {
  try {
    const result = await adminBookService.rejectBook(req.params.id, req.body.reason);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/books/:id/takedown
 * Body: { reason }
 */
async function takedownBook(req, res, next) {
  try {
    const result = await adminBookService.takedownBook(req.params.id, req.body.reason);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/admin/books/:id/toggle-featured
 */
async function toggleFeatured(req, res, next) {
  try {
    const result = await adminBookService.toggleFeatured(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { listBooks, getBookById, approveBook, rejectBook, takedownBook, toggleFeatured };
