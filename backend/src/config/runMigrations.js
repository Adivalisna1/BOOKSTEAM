require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('./database');

const MIGRATIONS_DIR = path.join(__dirname, '../../db/migrations');

async function runMigrations() {
  console.log('📦 Starting database migrations...');

  let files;
  try {
    files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch (err) {
    console.error('❌ Could not read migrations directory:', err.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('ℹ️  No migration files found.');
    process.exit(0);
  }

  // Ensure migrations tracking table exists (MySQL syntax)
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  for (const file of files) {
    const { rows } = await db.query(
      'SELECT id FROM schema_migrations WHERE filename = ?',
      [file]
    );

    if (rows.length > 0) {
      console.log(`  ⏭️  Skipped (already applied): ${file}`);
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const client = await db.getClient();
    try {
      await client.beginTransaction();

      // mysql2 does not support multi-statement execute by default.
      // Split on semicolons and run each statement individually.
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await client.execute(statement);
      }

      await client.execute(
        'INSERT INTO schema_migrations (filename) VALUES (?)',
        [file]
      );
      await client.commit();
      console.log(`  ✅ Applied: ${file}`);
    } catch (err) {
      await client.rollback();
      console.error(`  ❌ Failed on ${file}:`, err.message);
      client.release();
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log('✅ All migrations complete.');
  await db.pool.end();
}

runMigrations();
