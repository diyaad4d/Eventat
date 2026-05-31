const { Pool } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL connection pool.
// It will automatically use the DATABASE_URL if provided,
// or fallback to individual standard PG environment variables
// (PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT) if empty.
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {}; 

const pool = new Pool(poolConfig);

// Handle idle client errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err.message);
  console.error(err.stack);
});

// Basic check to verify the connection on initialization
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to the PostgreSQL database:', err.message);
  } else {
    console.log('✅ Successfully connected to the PostgreSQL database.');
  }
});

module.exports = pool;
