const db = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

/** List all events (admin sees all, active or not) with pagination. */
async function listEvents({ page = 1, limit = 20, is_active }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (is_active !== undefined) {
    conditions.push('is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM admin_events ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await db.query(
    `SELECT
      e.id, e.title, e.description, e.banner_url, e.link_url,
      e.start_date, e.end_date, e.is_active, e.created_at, e.updated_at,
      u.username AS created_by
    FROM admin_events e
    LEFT JOIN users u ON e.admin_id = u.id
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    events: rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/** Get single event by ID. */
async function getEventById(eventId) {
  const { rows } = await db.query(
    `SELECT e.*, u.username AS created_by
     FROM admin_events e
     LEFT JOIN users u ON e.admin_id = u.id
     WHERE e.id = ?`,
    [eventId]
  );
  if (rows.length === 0) throw new AppError('Event not found', 404);
  return rows[0];
}

/** Create a new event/banner. */
async function createEvent({ adminId, title, description, banner_url, link_url, start_date, end_date, is_active = true }) {
  const id = require('crypto').randomUUID();

  await db.query(
    `INSERT INTO admin_events
      (id, admin_id, title, description, banner_url, link_url, start_date, end_date, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, adminId, title, description || null, banner_url || null, link_url || null,
     start_date, end_date || null, is_active ? 1 : 0]
  );

  return getEventById(id);
}

/** Update an existing event. */
async function updateEvent(eventId, fields) {
  const { rows } = await db.query("SELECT id FROM admin_events WHERE id = ?", [eventId]);
  if (rows.length === 0) throw new AppError('Event not found', 404);

  const allowed = ['title', 'description', 'banner_url', 'link_url', 'start_date', 'end_date', 'is_active'];
  const setClauses = [];
  const params = [];

  allowed.forEach((key) => {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(key === 'is_active' ? (fields[key] ? 1 : 0) : fields[key]);
    }
  });

  if (setClauses.length === 0) throw new AppError('No valid fields to update', 400);

  setClauses.push('updated_at = NOW()');
  params.push(eventId);

  await db.query(
    `UPDATE admin_events SET ${setClauses.join(', ')} WHERE id = ?`,
    params
  );

  return getEventById(eventId);
}

/** Delete an event permanently. */
async function deleteEvent(eventId) {
  const { rows } = await db.query("SELECT id FROM admin_events WHERE id = ?", [eventId]);
  if (rows.length === 0) throw new AppError('Event not found', 404);

  await db.query("DELETE FROM admin_events WHERE id = ?", [eventId]);
  return { message: 'Event deleted successfully' };
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
