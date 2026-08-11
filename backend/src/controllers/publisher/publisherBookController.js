const publisherBookService = require('../../services/publisher/publisherBookService');

/** GET /api/v1/publisher/books */
async function listBooks(req, res, next) {
  try {
    const { page, limit, status, book_type } = req.query;
    const result = await publisherBookService.listBooks(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      status,
      book_type,
    });
    res.json({ success: true, data: result.books, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/publisher/books/:id */
async function getBookById(req, res, next) {
  try {
    const book = await publisherBookService.getBookById(req.user.id, req.params.id);
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
}

/** POST /api/v1/publisher/books */
async function createBook(req, res, next) {
  try {
    const result = await publisherBookService.createBook(req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PUT /api/v1/publisher/books/:id */
async function updateBook(req, res, next) {
  try {
    const book = await publisherBookService.updateBook(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/publisher/books/:id */
async function deleteBook(req, res, next) {
  try {
    const result = await publisherBookService.deleteBook(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** GET /api/v1/publisher/books/:id/sales */
async function getBookSales(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await publisherBookService.getBookSales(req.user.id, req.params.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { listBooks, getBookById, createBook, updateBook, deleteBook, getBookSales };
