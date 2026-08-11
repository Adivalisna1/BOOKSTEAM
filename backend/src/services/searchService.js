const db = require('../config/database');

/**
 * Search books by keyword using MySQL FULLTEXT or LIKE fallback.
 * Searches across title, description, genre, and publisher name.
 */
async function searchBooks({ q, genre, book_type, min_price, max_price, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = ["b.status = 'approved'"];

  let relevanceSelect = '';
  let relevanceOrder = 'b.avg_rating DESC';

  if (q && q.trim().length > 0) {
    const searchTerm = `%${q.trim()}%`;
    conditions.push(`(
      b.title LIKE ?
      OR b.description LIKE ?
      OR b.genre LIKE ?
      OR pp.display_name LIKE ?
      OR EXISTS (SELECT 1 FROM book_tags bt WHERE bt.book_id = b.id AND bt.tag LIKE ?)
    )`);
    // five placeholders for the five LIKE clauses above
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    relevanceSelect = `,
      (CASE WHEN b.title LIKE ?       THEN 10 ELSE 0 END +
       CASE WHEN pp.display_name LIKE ? THEN 5  ELSE 0 END +
       CASE WHEN b.genre LIKE ?        THEN 3  ELSE 0 END +
       1) AS relevance`;
    // three more placeholders for relevance scoring
    params.push(searchTerm, searchTerm, searchTerm);

    relevanceOrder = 'relevance DESC, b.avg_rating DESC';
  }

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

  const whereClause = conditions.join(' AND ');

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total
     FROM books b
     JOIN publisher_profiles pp ON b.publisher_id = pp.id
     WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      b.id, b.title, b.description, b.cover_url, b.price,
      b.book_type, b.genre, b.avg_rating, b.review_count, b.sales_count,
      b.is_family_shareable, b.published_at,
      pp.display_name AS publisher_name
      ${relevanceSelect}
    FROM books b
    JOIN publisher_profiles pp ON b.publisher_id = pp.id
    WHERE ${whereClause}
    ORDER BY ${relevanceOrder}
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Strip relevance field from response
  const books = rows.map(({ relevance, ...book }) => book);

  return {
    query: q || '',
    books,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

module.exports = { searchBooks };
