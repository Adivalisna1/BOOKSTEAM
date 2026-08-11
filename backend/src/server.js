require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3002;

async function start() {
  // Verify database connection before accepting traffic
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 BookSteam API running on http://localhost:${PORT}`);
    console.log(`   ENV  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await db.pool.end();
      console.log('Database pool closed. Bye.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
