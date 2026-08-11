const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'booksteam',
  password: process.env.DB_PASSWORD || 'booksteam',
  database: process.env.DB_NAME || 'booksteam',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

pool.on('connection', () => {
  // connection established
});

/**
 * Execute a query with optional params.
 * Returns { rows, fields } to keep the interface
 * consistent with the rest of the codebase.
 *
 * @param {string} sql
 * @param {Array}  params
 */
async function query(sql, params = []) {
  const [rows, fields] = await pool.query(sql, params);
  return { rows, fields };
}

/**
 * Get a raw connection from the pool.
 * Caller is responsible for calling connection.release()
 */
async function getClient() {
  return pool.getConnection();
}

module.exports = {
  query,
  getClient,
  pool,
};
