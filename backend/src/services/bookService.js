const db = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Get paginated list of approved books with optional filtering and sorting.
 */
async function listBooks({ page = 1, limit = 20, genre, book_type, min_price, max_price, sort_by = 'newest', order = 'desc', tag }) {
  const offset = (page - 1) * limit;
  const params = ['approved'];
  const conditions = ['b.status = ?'];

  if (genre) {
    conditions.push('b.genre = ?');
    params.push(genre);
  }
  if (book_type) {
    conditions.push('b.book_type = ?');
    params.push(book_type);
  }
  if (min_price !== undefined) {
    conditions.push('b.price >= ?');
    params.push(min_price);
  }
  if (max_price !== undefined) {
    conditions.push('b.price <= ?');
    params.push(max_price);
  }
  if (tag) {
    conditions.push('EXISTS (SELECT 1 FROM book_tags bt WHERE bt.book_id = b.id AND bt.tag = ?)');
    params.push(tag);
  }

  const whereClause = conditions.join(' AND ');

  const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  let orderClause;
  switch (sort_by) {
    case 'price':    orderClause = `b.price ${dir}`;         break;
    case 'rating':   orderClause = `b.avg_rating ${dir}`;    break;
    case 'popular':  orderClause = `b.sales_count ${dir}`;   break;
    case 'title':    orderClause = `b.title ${dir}`;         break;
    case 'newest':
    default:         orderClause = `b.published_at DESC`;    break;
  }

  const countResult = await db.query(
    `SELECT COUNT(*) AS total FROM books b WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const dataQuery = `
    SELECT
      b.id, b.title, b.description, b.cover_url, b.price,
      b.book_type, b.genre, b.language,
      b.is_family_shareable, b.is_featured,
      b.total_pages, b.avg_rating, b.review_count, b.sales_count,
      b.published_at,
      pp.display_name AS publisher_name,
      pp.id          AS publisher_id
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE ${whereClause}
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `;
  const dataResult = await db.query(dataQuery, [...params, limit, offset]);

  // Fetch tags in one query using IN (...)
  const bookIds = dataResult.rows.map((r) => r.id);
  let tagsMap = {};
  if (bookIds.length > 0) {
    const placeholders = bookIds.map(() => '?').join(', ');
    const tagsResult = await db.query(
      `SELECT book_id, tag FROM book_tags WHERE book_id IN (${placeholders})`,
      bookIds
    );
    tagsResult.rows.forEach((row) => {
      if (!tagsMap[row.book_id]) tagsMap[row.book_id] = [];
      tagsMap[row.book_id].push(row.tag);
    });
  }

  const books = dataResult.rows.map((row) => ({ ...row, tags: tagsMap[row.id] || [] }));

  return {
    books,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Featured books for homepage. */
async function getFeaturedBooks(limit = 6) {
  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.description, b.cover_url, b.price,
      b.book_type, b.genre, b.avg_rating, b.review_count, b.sales_count,
      b.is_family_shareable, b.published_at,
      pp.display_name AS publisher_name
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE b.status = 'approved' AND b.is_featured = 1
    ORDER BY b.sales_count DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

/** Newest released books. */
async function getNewReleases(limit = 10) {
  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.cover_url, b.price,
      b.book_type, b.genre, b.avg_rating, b.review_count,
      b.is_family_shareable, b.published_at,
      pp.display_name AS publisher_name
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE b.status = 'approved' AND b.published_at IS NOT NULL
    ORDER BY b.published_at DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

/** Top rated books. */
async function getTopRatedBooks(limit = 10) {
  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.cover_url, b.price,
      b.book_type, b.genre, b.avg_rating, b.review_count, b.sales_count,
      b.is_family_shareable, b.published_at,
      pp.display_name AS publisher_name
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE b.status = 'approved' AND b.review_count >= 5
    ORDER BY b.avg_rating DESC, b.review_count DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

/** Full book details by ID. */
async function getBookById(bookId) {
  const { rows } = await db.query(
    `SELECT
      b.*,
      pp.display_name AS publisher_name,
      pp.bio          AS publisher_bio,
      pp.id           AS publisher_profile_id,
      u.username      AS publisher_username,
      u.avatar_url    AS publisher_avatar
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    JOIN users u ON pp.user_id = u.id
    WHERE b.id = ? AND b.status = 'approved'`,
    [bookId]
  );

  if (rows.length === 0) throw new AppError('Book not found', 404);

  const book = rows[0];

  const { rows: tagRows } = await db.query('SELECT tag FROM book_tags WHERE book_id = ?', [bookId]);
  book.tags = tagRows.map((r) => r.tag);

  const { rows: relatedRows } = await db.query(
    `SELECT b.id, b.title, b.cover_url, b.price, b.avg_rating, b.genre,
            pp.display_name AS publisher_name
     FROM books b
     JOIN publisher_profiles pp ON b.publisher_id = pp.id
     WHERE b.genre = ? AND b.id != ? AND b.status = 'approved'
     ORDER BY b.avg_rating DESC
     LIMIT 5`,
    [book.genre, bookId]
  );
  book.related_books = relatedRows;

  return book;
}

/** Paginated reviews for a book. */
async function getBookReviews(bookId, { page = 1, limit = 10, sort_by = 'newest' }) {
  const offset = (page - 1) * limit;

  const { rows: bookCheck } = await db.query(
    "SELECT id FROM books WHERE id = ? AND status = 'approved'",
    [bookId]
  );
  if (bookCheck.length === 0) throw new AppError('Book not found', 404);

  let orderClause;
  switch (sort_by) {
    case 'helpful':     orderClause = 'r.helpful_count DESC'; break;
    case 'rating_high': orderClause = 'r.rating DESC';        break;
    case 'rating_low':  orderClause = 'r.rating ASC';         break;
    case 'newest':
    default:            orderClause = 'r.created_at DESC';    break;
  }

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM reviews WHERE book_id = ? AND is_approved = 1',
    [bookId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      r.id, r.rating, r.content, r.helpful_count, r.created_at,
      u.username, u.avatar_url, u.level
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.book_id = ? AND r.is_approved = 1
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?`,
    [bookId, limit, offset]
  );

  return {
    reviews: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { listBooks, getFeaturedBooks, getNewReleases, getTopRatedBooks, getBookById, getBookReviews };
