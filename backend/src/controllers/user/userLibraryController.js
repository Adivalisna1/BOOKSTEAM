const userLibraryService = require('../../services/user/userLibraryService');

/** GET /api/v1/user/library */
async function getLibrary(req, res, next) {
  try {
    const { page, limit, sort_by } = req.query;
    const result = await userLibraryService.getLibrary(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
      sort_by,
    });
    res.json({ success: true, data: result.library, pagination: result.pagination });
  } catch (err) { next(err); }
}

/** GET /api/v1/user/library/:bookId */
async function getLibraryBook(req, res, next) {
  try {
    const book = await userLibraryService.getLibraryBook(req.user.id, req.params.bookId);
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/user/library/:bookId/progress */
async function updateProgress(req, res, next) {
  try {
    const result = await userLibraryService.updateProgress(
      req.user.id,
      req.params.bookId,
      parseInt(req.body.progress_pages, 10)
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

/** POST /api/v1/user/library/:bookId/add */
async function addToLibrary(req, res, next) {
  try {
    const result = await userLibraryService.addToLibrary(req.user.id, req.params.bookId);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { getLibrary, getLibraryBook, updateProgress, addToLibrary };
