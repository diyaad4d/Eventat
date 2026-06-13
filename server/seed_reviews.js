const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedReviews() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get some users to be reviewers
    const usersRes = await client.query(`SELECT user_id, full_name FROM users WHERE role = 'customer' LIMIT 5`);
    const users = usersRes.rows;
    
    if (users.length === 0) {
      console.log('No customers found. Cannot seed reviews.');
      return;
    }

    // 2. Get some services
    const servicesRes = await client.query(`SELECT service_id, title FROM services LIMIT 5`);
    const services = servicesRes.rows;

    console.log(`Found ${users.length} customers and ${services.length} services. Seeding reviews...`);

    const reviewTexts = [
      "Absolutely amazing service! Would highly recommend.",
      "Very professional and the quality was outstanding.",
      "Good experience overall, but there were some minor delays.",
      "Exceeded our expectations! The team was fantastic.",
      "Fair pricing and good communication. Will book again."
    ];

    // 3. Insert reviews
    for (const service of services) {
      // Create 2-4 reviews per service
      const numReviews = Math.floor(Math.random() * 3) + 2;
      let totalRating = 0;
      
      console.log(`Seeding ${numReviews} reviews for service: ${service.title}`);
      
      for (let i = 0; i < numReviews; i++) {
        const user = users[i % users.length];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const text = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        
        totalRating += rating;
        
        // Insert review, ON CONFLICT DO NOTHING to prevent unique constraint errors if already seeded
        await client.query(`
          INSERT INTO reviews (service_id, customer_id, rating, review_text)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (service_id, customer_id) DO NOTHING
        `, [service.service_id, user.user_id, rating, text]);
      }

      // Update avg_rating and review_count in services table
      await client.query(`
        UPDATE services 
        SET 
          review_count = (SELECT count(*) FROM reviews WHERE service_id = $1),
          avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE service_id = $1)
        WHERE service_id = $1
      `, [service.service_id]);
    }

    await client.query('COMMIT');
    console.log('Successfully seeded reviews and updated service ratings!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding reviews:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedReviews();
