const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/**
 * List books with optional status filter + pagination.
 * Default: show all statuses (admin sees everything).
 */
async function listBooks({ page = 1, limit = 20, status, book_type, genre }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }
  if (book_type) {
    conditions.push('b.book_type = ?');
    params.push(book_type);
  }
  if (genre) {
    conditions.push('b.genre = ?');
    params.push(genre);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM books b ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.cover_url, b.price, b.book_type, b.genre,
      b.status, b.is_featured, b.avg_rating, b.review_count, b.sales_count,
      b.published_at, b.created_at,
      pp.display_name AS publisher_name,
      pp.id           AS publisher_id
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    books: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get full book detail regardless of status. */
async function getBookById(bookId) {
  const { rows } = await db.query(
    `SELECT b.*, pp.display_name AS publisher_name, pp.id AS publisher_id,
            u.username AS publisher_username, u.email AS publisher_email
     FROM books b
     JOIN publisher_profiles pp ON b.publisher_id = pp.id
     JOIN users u ON pp.user_id = u.id
     WHERE b.id = ?`,
    [bookId]
  );
  if (rows.length === 0) throw new AppError('Book not found', 404);

  const book = rows[0];
  const { rows: tagRows } = await db.query('SELECT tag FROM book_tags WHERE book_id = ?', [bookId]);
  book.tags = tagRows.map((r) => r.tag);

  return book;
}

/** Approve a pending book → set status to 'approved' and published_at to NOW(). */
async function approveBook(bookId, adminId) {
  const { rows } = await db.query("SELECT id, status FROM books WHERE id = ?", [bookId]);
  if (rows.length === 0) throw new AppError('Book not found', 404);
  if (rows[0].status === 'approved') throw new AppError('Book is already approved', 400);

  await db.query(
    "UPDATE books SET status = 'approved', published_at = NOW(), updated_at = NOW() WHERE id = ?",
    [bookId]
  );

  return { message: 'Book approved successfully', book_id: bookId };
}

/** Reject a pending book with a reason. */
async function rejectBook(bookId, reason) {
  const { rows } = await db.query("SELECT id, status FROM books WHERE id = ?", [bookId]);
  if (rows.length === 0) throw new AppError('Book not found', 404);
  if (rows[0].status === 'takedown') throw new AppError('Book is already taken down', 400);

  await db.query(
    "UPDATE books SET status = 'rejected', updated_at = NOW() WHERE id = ?",
    [bookId]
  );

  return { message: 'Book rejected', book_id: bookId };
}

/** Takedown a live book. */
async function takedownBook(bookId, reason) {
  const { rows } = await db.query("SELECT id, status FROM books WHERE id = ?", [bookId]);
  if (rows.length === 0) throw new AppError('Book not found', 404);
  if (rows[0].status === 'takedown') throw new AppError('Book is already taken down', 400);

  await db.query(
    "UPDATE books SET status = 'takedown', updated_at = NOW() WHERE id = ?",
    [bookId]
  );

  return { message: 'Book taken down successfully', book_id: bookId };
}

/** Toggle is_featured flag. */
async function toggleFeatured(bookId) {
  const { rows } = await db.query("SELECT id, is_featured FROM books WHERE id = ?", [bookId]);
  if (rows.length === 0) throw new AppError('Book not found', 404);

  const newVal = rows[0].is_featured ? 0 : 1;
  await db.query(
    "UPDATE books SET is_featured = ?, updated_at = NOW() WHERE id = ?",
    [newVal, bookId]
  );

  return { message: `Book ${newVal ? 'featured' : 'unfeatured'}`, is_featured: Boolean(newVal) };
}

module.exports = { listBooks, getBookById, approveBook, rejectBook, takedownBook, toggleFeatured };
