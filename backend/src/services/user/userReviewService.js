const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Create a review. User must own the book and not have reviewed it yet. */
async function createReview(userId, bookId, { rating, content }) {
  // Book must exist and be approved
  const { rows: bookRows } = await db.query(
    "SELECT id FROM books WHERE id = ? AND status = 'approved'",
    [bookId]
  );
  if (bookRows.length === 0) throw new AppError('Book not found', 404);

  // User must own the book
  const { rows: libRows } = await db.query(
    'SELECT id FROM libraries WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (libRows.length === 0) throw new AppError('You must own this book to write a review', 403);

  // Check duplicate
  const { rows: existing } = await db.query(
    'SELECT id FROM reviews WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (existing.length > 0) throw new AppError('You have already reviewed this book', 409);

  const id = require('crypto').randomUUID();
  await db.query(
    `INSERT INTO reviews (id, user_id, book_id, rating, content, is_approved)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, userId, bookId, rating, content || null]
  );

  // Recalculate avg_rating and review_count on the book
  await _recalcBookRating(bookId);

  return { message: 'Review submitted and pending approval', review_id: id };
}

/** Edit own review (only rating/content, re-submit for approval). */
async function updateReview(userId, bookId, { rating, content }) {
  const { rows } = await db.query(
    'SELECT id FROM reviews WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (rows.length === 0) throw new AppError('Review not found', 404);

  const setClauses = ['is_approved = 0', 'updated_at = NOW()'];
  const params = [];

  if (rating !== undefined) { setClauses.push('rating = ?');  params.push(rating); }
  if (content !== undefined) { setClauses.push('content = ?'); params.push(content); }

  params.push(userId, bookId);

  await db.query(
    `UPDATE reviews SET ${setClauses.join(', ')} WHERE user_id = ? AND book_id = ?`,
    params
  );

  await _recalcBookRating(bookId);

  return { message: 'Review updated and pending re-approval' };
}

/** Delete own review. */
async function deleteReview(userId, bookId) {
  const { rows } = await db.query(
    'SELECT id FROM reviews WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (rows.length === 0) throw new AppError('Review not found', 404);

  await db.query(
    'DELETE FROM reviews WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );

  await _recalcBookRating(bookId);

  return { message: 'Review deleted successfully' };
}

/** Recalculate avg_rating and review_count based on approved reviews only. */
async function _recalcBookRating(bookId) {
  await db.query(
    `UPDATE books
     SET avg_rating   = (SELECT IFNULL(AVG(rating), 0) FROM reviews WHERE book_id = ? AND is_approved = 1),
         review_count = (SELECT COUNT(*) FROM reviews WHERE book_id = ? AND is_approved = 1),
         updated_at   = NOW()
     WHERE id = ?`,
    [bookId, bookId, bookId]
  );
}

module.exports = { createReview, updateReview, deleteReview };
