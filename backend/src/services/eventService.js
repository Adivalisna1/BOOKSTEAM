const db = require('../config/database');

/**
 * Get all currently active events/banners.
 */
async function getActiveEvents() {
  const { rows } = await db.query(
    `SELECT
      id, title, description, banner_url, link_url,
      start_date, end_date, is_active, created_at
    FROM admin_events
    WHERE is_active = 1
      AND start_date <= NOW()
      AND (end_date IS NULL OR end_date >= NOW())
    ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = { getActiveEvents };
