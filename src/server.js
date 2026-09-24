import app from './app.js';
import { config } from './config/env.js';
import { pool, testConnection } from './config/db.js';

const PORT = config.port;

const startServer = async () => {
  const server = app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 AdsWheeler Backend Server is running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`===============================================`);

    // Test DB connection on startup
    const dbStatus = await testConnection();
    if (dbStatus.connected) {
      console.log(` PostgreSQL connected at ${dbStatus.time}`);
    } else {
      console.warn(`⚠️  PostgreSQL connection warning: ${dbStatus.error}`);
      console.warn(`👉 Make sure your PostgreSQL server is running and .env settings are correct.`);
    }
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('💤 Express HTTP server closed.');
      await pool.end();
      console.log(' PostgreSQL pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
