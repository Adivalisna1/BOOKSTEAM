const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Get all wishlisted books for a user. */
async function getWishlist(userId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM wishlists WHERE user_id = ?',
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      w.id AS wishlist_id, w.added_at,
      b.id AS book_id, b.title, b.cover_url, b.price,
      b.book_type, b.genre, b.avg_rating, b.review_count,
      b.is_family_shareable,
      pp.display_name AS publisher_name
    FROM wishlists w
    JOIN books b ON w.book_id = b.id
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE w.user_id = ? AND b.status = 'approved'
    ORDER BY w.added_at DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    wishlist: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Add a book to wishlist. */
async function addToWishlist(userId, bookId) {
  // Verify book exists and is approved
  const { rows: bookRows } = await db.query(
    "SELECT id FROM books WHERE id = ? AND status = 'approved'",
    [bookId]
  );
  if (bookRows.length === 0) throw new AppError('Book not found', 404);

  // Check already in wishlist
  const { rows: existing } = await db.query(
    'SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (existing.length > 0) throw new AppError('Book is already in your wishlist', 409);

  // Check already owned
  const { rows: owned } = await db.query(
    'SELECT id FROM libraries WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (owned.length > 0) throw new AppError('You already own this book', 409);

  const id = require('crypto').randomUUID();
  await db.query(
    'INSERT INTO wishlists (id, user_id, book_id) VALUES (?, ?, ?)',
    [id, userId, bookId]
  );

  return { message: 'Book added to wishlist', book_id: bookId };
}

/** Remove a book from wishlist. */
async function removeFromWishlist(userId, bookId) {
  const { rows } = await db.query(
    'SELECT id FROM wishlists WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
  if (rows.length === 0) throw new AppError('Book not found in your wishlist', 404);

  await db.query(
    'DELETE FROM wishlists WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );

  return { message: 'Book removed from wishlist', book_id: bookId };
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
