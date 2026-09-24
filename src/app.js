import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';

import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/users.routes.js';
import adRoutes from './routes/ads.routes.js';
import applicationRoutes from './routes/applications.routes.js';
import notificationRoutes from './routes/notifications.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Root endpoint with API directory
app.get('/', (req, res) => {
  res.json({
    name: 'AdsWheeler API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      users: {
        create: 'POST /api/users',
        list: 'GET /api/users?role=DRIVER|PUBLISHER',
        getById: 'GET /api/users/:id',
        updateDriverProfile: 'PUT /api/users/:id/driver-profile',
        updatePublisherProfile: 'PUT /api/users/:id/publisher-profile'
      },
      advertisements: {
        create: 'POST /api/ads',
        list: 'GET /api/ads?status=PUBLISHED&target_vehicle_type=AUTO_RICKSHAW',
        getById: 'GET /api/ads/:id',
        update: 'PUT /api/ads/:id',
        delete: 'DELETE /api/ads/:id'
      },
      adApplications: {
        apply: 'POST /api/applications',
        list: 'GET /api/applications?driver_id=...&advertisement_id=...',
        getById: 'GET /api/applications/:id',
        updateStatus: 'PATCH /api/applications/:id/status'
      },
      notifications: {
        create: 'POST /api/notifications',
        list: 'GET /api/notifications?user_id=...&read_status=false',
        markRead: 'PATCH /api/notifications/:id/read',
        delete: 'DELETE /api/notifications/:id'
      }
    }
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

export default app;
