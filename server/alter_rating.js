const db = require('./db');

async function migrate() {
  try {
    const { rows } = await db.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'reviews'::regclass AND contype = 'c'
    `);
    
    for (const row of rows) {
      console.log('Dropping constraint:', row.conname);
      await db.query(`ALTER TABLE reviews DROP CONSTRAINT ${row.conname}`);
    }

    await db.query(`ALTER TABLE reviews ALTER COLUMN rating TYPE DECIMAL(2,1)`);
    await db.query(`ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1.0 AND rating <= 5.0)`);
    
    console.log('Successfully altered reviews rating to DECIMAL(2,1)');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
