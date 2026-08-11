const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

async function _getPublisherProfileId(userId) {
  const { rows } = await db.query(
    "SELECT id FROM publisher_profiles WHERE user_id = ? AND status = 'approved'",
    [userId]
  );
  if (rows.length === 0) throw new AppError('Approved publisher profile not found', 404);
  return rows[0].id;
}

/**
 * Overview analytics: total books, total sales, total revenue,
 * pending revenue, and monthly breakdown.
 */
async function getAnalytics(userId) {
  const publisherId = await _getPublisherProfileId(userId);

  // Book counts by status
  const { rows: bookStats } = await db.query(
    `SELECT status, COUNT(*) AS count
     FROM books WHERE publisher_id = ?
     GROUP BY status`,
    [publisherId]
  );

  // Revenue totals
  const { rows: revenueStats } = await db.query(
    `SELECT
      IFNULL(SUM(CASE WHEN rs.status = 'released' THEN rs.publisher_share ELSE 0 END), 0)  AS total_revenue,
      IFNULL(SUM(CASE WHEN rs.status = 'holding'  THEN rs.publisher_share ELSE 0 END), 0)  AS pending_revenue,
      IFNULL(SUM(CASE WHEN rs.status = 'refunded' THEN rs.publisher_share ELSE 0 END), 0)  AS refunded_revenue,
      COUNT(CASE WHEN rs.status = 'released' THEN 1 END)                                    AS total_transactions,
      IFNULL(SUM(rs.total_amount), 0)                                                        AS total_gross
    FROM revenue_splits rs
    WHERE rs.publisher_id = ?`,
    [publisherId]
  );

  // Sales count
  const { rows: salesRows } = await db.query(
    `SELECT IFNULL(SUM(b.sales_count), 0) AS total_sales
     FROM books b WHERE b.publisher_id = ? AND b.status = 'approved'`,
    [publisherId]
  );

  // Monthly revenue for the last 12 months
  const { rows: monthly } = await db.query(
    `SELECT
      DATE_FORMAT(t.purchase_at, '%Y-%m') AS month,
      COUNT(*)                             AS transactions,
      IFNULL(SUM(rs.publisher_share), 0)  AS revenue
    FROM revenue_splits rs
    JOIN transactions t ON rs.transaction_id = t.id
    WHERE rs.publisher_id = ?
      AND rs.status = 'released'
      AND t.purchase_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC`,
    [publisherId]
  );

  // Top 5 best-selling books
  const { rows: topBooks } = await db.query(
    `SELECT
      b.id, b.title, b.cover_url, b.price,
      b.sales_count, b.avg_rating,
      IFNULL(SUM(rs.publisher_share), 0) AS revenue
    FROM books b
    LEFT JOIN revenue_splits rs ON rs.publisher_id = ? AND rs.status = 'released'
    LEFT JOIN transactions t ON rs.transaction_id = t.id AND t.book_id = b.id
    WHERE b.publisher_id = ? AND b.status = 'approved'
    GROUP BY b.id
    ORDER BY b.sales_count DESC
    LIMIT 5`,
    [publisherId, publisherId]
  );

  const bookCountMap = {};
  bookStats.forEach((r) => { bookCountMap[r.status] = parseInt(r.count, 10); });

  return {
    books: {
      total:    Object.values(bookCountMap).reduce((a, b) => a + b, 0),
      approved: bookCountMap.approved  || 0,
      pending:  bookCountMap.pending   || 0,
      rejected: bookCountMap.rejected  || 0,
      takedown: bookCountMap.takedown  || 0,
    },
    revenue: {
      total_gross:        parseFloat(revenueStats[0].total_gross),
      total_revenue:      parseFloat(revenueStats[0].total_revenue),
      pending_revenue:    parseFloat(revenueStats[0].pending_revenue),
      refunded_revenue:   parseFloat(revenueStats[0].refunded_revenue),
      total_transactions: parseInt(revenueStats[0].total_transactions, 10),
    },
    total_sales: parseInt(salesRows[0].total_sales, 10),
    monthly_revenue: monthly,
    top_books: topBooks,
  };
}

module.exports = { getAnalytics };
