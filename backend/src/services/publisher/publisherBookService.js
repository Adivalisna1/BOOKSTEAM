const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** Resolve publisher_profiles.id from user ID. */
async function _getPublisherProfileId(userId) {
  const { rows } = await db.query(
    "SELECT id, status FROM publisher_profiles WHERE user_id = ?",
    [userId]
  );
  if (rows.length === 0) throw new AppError('Publisher profile not found', 404);
  if (rows[0].status !== 'approved') throw new AppError('Your publisher account is not approved yet', 403);
  return rows[0].id;
}

/** List all books belonging to this publisher, with optional filters. */
async function listBooks(userId, { page = 1, limit = 20, status, book_type }) {
  const publisherId = await _getPublisherProfileId(userId);
  const offset = (page - 1) * limit;
  const params = [publisherId];
  const conditions = ['b.publisher_id = ?'];

  if (status)    { conditions.push('b.status = ?');    params.push(status); }
  if (book_type) { conditions.push('b.book_type = ?'); params.push(book_type); }

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM books b WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.cover_url, b.price, b.book_type, b.genre,
      b.status, b.is_featured, b.is_family_shareable, b.is_early_access,
      b.total_pages, b.avg_rating, b.review_count, b.sales_count,
      b.published_at, b.created_at, b.updated_at
    FROM books b
    WHERE ${whereClause}
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

/** Get full detail of a single book (must belong to this publisher). */
async function getBookById(userId, bookId) {
  const publisherId = await _getPublisherProfileId(userId);

  const { rows } = await db.query(
    `SELECT b.*
     FROM books b
     WHERE b.id = ? AND b.publisher_id = ?`,
    [bookId, publisherId]
  );
  if (rows.length === 0) throw new AppError('Book not found', 404);

  const book = rows[0];
  const { rows: tagRows } = await db.query('SELECT tag FROM book_tags WHERE book_id = ?', [bookId]);
  book.tags = tagRows.map((r) => r.tag);

  return book;
}

/** Upload a new book (status starts as 'pending'). */
async function createBook(userId, { title, description, cover_url, file_url, price, book_type, genre, language, is_family_shareable, is_early_access, total_pages, tags }) {
  const publisherId = await _getPublisherProfileId(userId);

  const id = require('crypto').randomUUID();

  await db.query(
    `INSERT INTO books
      (id, publisher_id, title, description, cover_url, file_url, price,
       book_type, genre, language, is_family_shareable, is_early_access,
       total_pages, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id, publisherId, title, description || null,
      cover_url || null, file_url || null, price,
      book_type, genre, language || 'id',
      is_family_shareable ? 1 : 0,
      is_early_access ? 1 : 0,
      total_pages || 0,
    ]
  );

  // Insert tags if provided
  if (Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      const tagId = require('crypto').randomUUID();
      await db.query(
        'INSERT INTO book_tags (id, book_id, tag) VALUES (?, ?, ?)',
        [tagId, id, tag.trim().toLowerCase()]
      );
    }
  }

  return {
    message: 'Book submitted for admin review.',
    book_id: id,
  };
}

/** Edit a book. Only allowed if book is pending or rejected (not approved/live). */
async function updateBook(userId, bookId, fields) {
  const publisherId = await _getPublisherProfileId(userId);

  const { rows } = await db.query(
    'SELECT id, status FROM books WHERE id = ? AND publisher_id = ?',
    [bookId, publisherId]
  );
  if (rows.length === 0) throw new AppError('Book not found', 404);

  // If book is approved/live, only allow metadata edits (price, family_shareable, early_access)
  const isLive = rows[0].status === 'approved';

  const allowed = isLive
    ? ['price', 'is_family_shareable', 'is_early_access', 'cover_url']
    : ['title', 'description', 'cover_url', 'file_url', 'price', 'book_type', 'genre', 'language', 'is_family_shareable', 'is_early_access', 'total_pages'];

  const setClauses = ['updated_at = NOW()'];
  const params = [];

  // If editing a pending book, re-submit for review
  if (!isLive && Object.keys(fields).some((k) => allowed.includes(k))) {
    setClauses.push("status = 'pending'");
  }

  allowed.forEach((key) => {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      const val = ['is_family_shareable', 'is_early_access'].includes(key) ? (fields[key] ? 1 : 0) : fields[key];
      params.push(val);
    }
  });

  if (setClauses.length === 1) throw new AppError('No valid fields to update', 400);

  params.push(bookId, publisherId);
  await db.query(
    `UPDATE books SET ${setClauses.join(', ')} WHERE id = ? AND publisher_id = ?`,
    params
  );

  // Update tags if provided and book is not live
  if (!isLive && Array.isArray(fields.tags)) {
    await db.query('DELETE FROM book_tags WHERE book_id = ?', [bookId]);
    for (const tag of fields.tags) {
      const tagId = require('crypto').randomUUID();
      await db.query(
        'INSERT INTO book_tags (id, book_id, tag) VALUES (?, ?, ?)',
        [tagId, bookId, tag.trim().toLowerCase()]
      );
    }
  }

  return getBookById(userId, bookId);
}

/** Delete a book — only allowed if still pending or rejected. */
async function deleteBook(userId, bookId) {
  const publisherId = await _getPublisherProfileId(userId);

  const { rows } = await db.query(
    'SELECT id, status FROM books WHERE id = ? AND publisher_id = ?',
    [bookId, publisherId]
  );
  if (rows.length === 0) throw new AppError('Book not found', 404);
  if (!['pending', 'rejected'].includes(rows[0].status)) {
    throw new AppError('Only pending or rejected books can be deleted', 403);
  }

  await db.query('DELETE FROM book_tags WHERE book_id = ?', [bookId]);
  await db.query('DELETE FROM books WHERE id = ?', [bookId]);

  return { message: 'Book deleted successfully', book_id: bookId };
}

/** Per-book sales stats. */
async function getBookSales(userId, bookId, { page = 1, limit = 20 }) {
  const publisherId = await _getPublisherProfileId(userId);
  const offset = (page - 1) * limit;

  const { rows: bookRows } = await db.query(
    'SELECT id, title, price, sales_count FROM books WHERE id = ? AND publisher_id = ?',
    [bookId, publisherId]
  );
  if (bookRows.length === 0) throw new AppError('Book not found', 404);

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total
     FROM transactions t
     JOIN revenue_splits rs ON rs.transaction_id = t.id
     WHERE t.book_id = ? AND rs.publisher_id = ?`,
    [bookId, publisherId]
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows: sales } = await db.query(
    `SELECT
      t.id AS transaction_id, t.amount AS sale_amount,
      t.payment_method, t.status, t.purchase_at,
      rs.publisher_share, rs.status AS revenue_status
    FROM transactions t
    JOIN revenue_splits rs ON rs.transaction_id = t.id
    WHERE t.book_id = ? AND rs.publisher_id = ?
    ORDER BY t.purchase_at DESC
    LIMIT ? OFFSET ?`,
    [bookId, publisherId, limit, offset]
  );

  return {
    book: bookRows[0],
    sales,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { listBooks, getBookById, createBook, updateBook, deleteBook, getBookSales };
