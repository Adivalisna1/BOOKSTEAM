const db = require('../config/database');

/**
 * Get all distinct genres with book counts.
 */
async function listGenres() {
  const { rows } = await db.query(
    `SELECT
      genre,
      COUNT(*) AS book_count
    FROM books
    WHERE status = 'approved'
    GROUP BY genre
    ORDER BY book_count DESC`
  );
  return rows;
}

module.exports = { listGenres };
