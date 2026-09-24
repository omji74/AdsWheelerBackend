import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const poolConfig = config.database.connectionString
  ? {
      connectionString: config.database.connectionString,
      ssl: config.database.ssl
    }
  : {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      ssl: config.database.ssl
    };

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database pool');
});

pool.on('error', (err) => {
  console.error(' Unexpected PostgreSQL client error:', err.message);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.nodeEnv === 'development') {
      console.log(`Executed query: ${text.slice(0, 80).trim()}... (${duration}ms, rows: ${res.rowCount})`);
    }
    return res;
  } catch (error) {
    console.error(' Database query error:', {
      text,
      error: error.message
    });
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    return {
      connected: true,
      time: res.rows[0].current_time
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};
