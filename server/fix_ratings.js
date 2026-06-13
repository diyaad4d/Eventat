const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixAllRatings() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Fixing review_count and avg_rating for ALL services in the database based on real reviews...');

    const res = await client.query(`
      UPDATE services 
      SET 
        review_count = (SELECT count(*) FROM reviews WHERE service_id = services.service_id),
        avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE service_id = services.service_id), 0)
    `);

    await client.query('COMMIT');
    console.log(`Successfully updated ${res.rowCount} services! All fake ratings are now removed.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error fixing ratings:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixAllRatings();
