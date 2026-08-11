const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** List all books owned by the user. */
async function getLibrary(userId, { page = 1, limit = 20, sort_by = 'newest' }) {
  const offset = (page - 1) * limit;

  let orderClause;
  switch (sort_by) {
    case 'title':         orderClause = 'b.title ASC';             break;
    case 'last_read':     orderClause = 'l.last_read_at DESC';     break;
    case 'progress':      orderClause = 'l.progress_percent DESC'; break;
    case 'newest':
    default:              orderClause = 'l.acquired_at DESC';      break;
  }

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM libraries WHERE user_id = ?',
    [userId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      l.id AS library_id,
      l.progress_pages, l.progress_percent,
      l.last_read_at, l.acquired_at,
      b.id AS book_id, b.title, b.cover_url,
      b.book_type, b.genre, b.total_pages,
      b.is_family_shareable,
      pp.display_name AS publisher_name
    FROM libraries l
    JOIN books b ON l.book_id = b.id
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE l.user_id = ?
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    library: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get a single library entry with full book detail. */
async function getLibraryBook(userId, bookId) {
  const { rows } = await db.query(
    `SELECT
      l.id AS library_id,
      l.progress_pages, l.progress_percent,
      l.last_read_at, l.acquired_at,
      l.transaction_id,
      b.id AS book_id, b.title, b.description, b.cover_url, b.file_url,
      b.book_type, b.genre, b.total_pages, b.language,
      b.is_family_shareable, b.avg_rating,
      pp.display_name AS publisher_name
    FROM libraries l
    JOIN books b ON l.book_id = b.id
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE l.user_id = ? AND l.book_id = ?`,
    [userId, bookId]
  );
  if (rows.length === 0) throw new AppError('Book not found in your library', 404);
  return rows[0];
}

/**
 * Update reading progress.
 * progress_pages must be between 0 and total_pages.
 */
async function updateProgress(userId, bookId, progressPages) {
  const { rows } = await db.query(
    `SELECT l.id, b.total_pages
     FROM libraries l
     JOIN books b ON l.book_id = b.id
     WHERE l.user_id = ? AND l.book_id = ?`,
    [userId, bookId]
  );
  if (rows.length === 0) throw new AppError('Book not found in your library', 404);

  const { total_pages } = rows[0];

  if (progressPages < 0 || progressPages > total_pages) {
    throw new AppError(`progress_pages must be between 0 and ${total_pages}`, 400);
  }

  const progressPercent = total_pages > 0
    ? parseFloat(((progressPages / total_pages) * 100).toFixed(2))
    : 0;

  await db.query(
    `UPDATE libraries
     SET progress_pages = ?, progress_percent = ?, last_read_at = NOW(), updated_at = NOW()
     WHERE user_id = ? AND book_id = ?`,
    [progressPages, progressPercent, userId, bookId]
  );

  return { book_id: bookId, progress_pages: progressPages, progress_percent: progressPercent };
}

module.exports = { getLibrary, getLibraryBook, updateProgress };
