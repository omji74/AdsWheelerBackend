import { Router } from 'express';
import { testConnection } from '../config/db.js';
import { config } from '../config/env.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbStatus = await testConnection();

  return res.status(dbStatus.connected ? 200 : 503).json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected',
      time: dbStatus.time || null,
      error: dbStatus.error || null
    }
  });
});

export default router;
