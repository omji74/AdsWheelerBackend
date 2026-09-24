import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing PostgreSQL database tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schemaSql);
    console.log(' PostgreSQL tables successfully created/verified!');
  } catch (error) {
    console.error(' Error initializing database:', error.message);
    throw error;
  }
};

// If run directly from terminal: `node src/db/initDb.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async () => {
      await pool.end();
      process.exit(1);
    });
}
