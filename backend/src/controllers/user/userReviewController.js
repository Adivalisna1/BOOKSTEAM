const userReviewService = require('../../services/user/userReviewService');

/** POST /api/v1/user/reviews/:bookId */
async function createReview(req, res, next) {
  try {
    const { rating, content } = req.body;
    const result = await userReviewService.createReview(req.user.id, req.params.bookId, { rating, content });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** PUT /api/v1/user/reviews/:bookId */
async function updateReview(req, res, next) {
  try {
    const { rating, content } = req.body;
    const result = await userReviewService.updateReview(req.user.id, req.params.bookId, { rating, content });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/user/reviews/:bookId */
async function deleteReview(req, res, next) {
  try {
    const result = await userReviewService.deleteReview(req.user.id, req.params.bookId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { createReview, updateReview, deleteReview };
