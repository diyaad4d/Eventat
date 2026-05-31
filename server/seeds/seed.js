const bcrypt = require('bcryptjs');
const db = require('../db');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 2. Insert Users (1 Admin, 1 Customer, 2 Vendors)
    console.log('Inserting users...');
    const usersRes = await db.query(`
      INSERT INTO users (role, username, email, password_hash, full_name, is_active)
      VALUES 
        ('admin', 'admin', 'admin@eventat.local', $1, 'System Admin', true),
        ('customer', 'john_doe', 'john@example.com', $1, 'John Doe', true),
        ('vendor', 'venue_co', 'contact@venueco.com', $1, 'Venue Company', true),
        ('vendor', 'alice_photo', 'alice@photography.local', $1, 'Alice Photographer', true)
      RETURNING user_id, role, username;
    `, [passwordHash]);

    const users = usersRes.rows;
    const customerId = users.find(u => u.username === 'john_doe').user_id;
    const vendor1Id = users.find(u => u.username === 'venue_co').user_id;
    const vendor2Id = users.find(u => u.username === 'alice_photo').user_id;

    // 3. Insert Customer Profile
    await db.query(`
      INSERT INTO customer_profiles (customer_id, city)
      VALUES ($1, 'Amman')
    `, [customerId]);

    // 4. Insert Categories & Subcategories
    console.log('Inserting categories & subcategories...');
    const catsRes = await db.query(`
      INSERT INTO categories (name, slug, description, image_url, icon_name, is_active)
      VALUES 
        ('Venue', 'venue', 'Beautiful event venues', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 'MapPin', true),
        ('Catering', 'catering', 'Delicious catering services', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80', 'Utensils', true),
        ('Photography & Videography', 'photography-videography', 'Professional photographers', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Camera', true),
        ('Music & Entertainment', 'music-entertainment', 'Music, bands, and DJs', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', 'Music', true),
        ('Decoration', 'decoration', 'Event decoration', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', 'Star', true),
        ('Cakes & Desserts', 'cakes-desserts', 'Custom cakes and desserts', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', 'Cake', true),
        ('Makeup & Beauty', 'makeup-beauty', 'Beauty services', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80', 'Scissors', true),
        ('Event Planning', 'event-planning', 'Event planning and coordination', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80', 'Clipboard', true),
        ('Transportation', 'transportation', 'Limousines and transport', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', 'Car', true),
        ('Invitations & Prints', 'invitations-prints', 'Invitations and prints', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80', 'Mail', true)
      RETURNING category_id, slug;
    `);
    
    const venuesCatId = catsRes.rows.find(c => c.slug === 'venue').category_id;
    const photoCatId = catsRes.rows.find(c => c.slug === 'photography-videography').category_id;

    await db.query(`
      INSERT INTO subcategories (category_id, name, slug)
      VALUES 
        ($1, 'Hotels', 'hotels'),
        ($1, 'Farms', 'farms'),
        ($2, 'Wedding Photography', 'wedding-photography'),
        ($2, 'Videography', 'videography')
    `, [venuesCatId, photoCatId]);
    
    const subcatsRes = await db.query(`SELECT subcategory_id, slug FROM subcategories`);
    const hotelsSubId = subcatsRes.rows.find(s => s.slug === 'hotels').subcategory_id;
    const weddingPhotoSubId = subcatsRes.rows.find(s => s.slug === 'wedding-photography').subcategory_id;

    // 5. Insert Vendor Profiles (must include vendor_type, payment_method, etc)
    console.log('Inserting vendor profiles...');
    await db.query(`
      INSERT INTO vendor_profiles (
        vendor_id, vendor_type, company_name, city, preferred_category_id, 
        social_links, payment_method, iban, registration_status
      )
      VALUES 
        ($1, 'company', 'Luxury Venues Co', 'Amman', $3, '[{"platform": "instagram", "url": "https://instagram.com/venueco"}]'::jsonb, 'full_online', 'JO1234567890123456789012345678', 'approved'),
        ($2, 'freelancer', 'Alice Shots', 'Amman', $4, '[{"platform": "website", "url": "https://aliceshots.com"}]'::jsonb, 'deposit_cash', 'JO0987654321098765432109876543', 'approved')
    `, [vendor1Id, vendor2Id, venuesCatId, photoCatId]);

    // 6. Insert Event Types
    console.log('Inserting event types...');
    await db.query(`
      INSERT INTO event_types (name, slug, description, image_url)
      VALUES 
        ('Wedding', 'wedding', 'Wedding celebrations', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80'),
        ('Graduation', 'graduation', 'Graduation parties', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'),
        ('Corporate', 'corporate', 'Corporate events and conferences', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80'),
        ('Birthday', 'birthday', 'Birthday celebrations', 'https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?w=800&q=80'),
        ('General', 'general', 'Other general events', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80')
    `);

    // 7. Insert Services & Images
    console.log('Inserting services & images...');
    
    // Generate 12 realistic services
    const servicesToInsert = [
      { vendor: vendor1Id, cat: venuesCatId, subcat: hotelsSubId, title: 'Grand Crystal Ballroom', price: 2000, images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'] },
      { vendor: vendor1Id, cat: venuesCatId, subcat: hotelsSubId, title: 'Amman Royal Palace', price: 3500, images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'] },
      { vendor: vendor1Id, cat: venuesCatId, subcat: hotelsSubId, title: 'Desert Rose Hall', price: 1500, images: ['https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80'] },
      { vendor: vendor1Id, cat: venuesCatId, subcat: null, title: 'Outdoor Garden Venue', price: 1800, images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'] },
      { vendor: vendor1Id, cat: venuesCatId, subcat: null, title: 'Sunset Terrace', price: 1200, images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'] },
      { vendor: vendor1Id, cat: venuesCatId, subcat: hotelsSubId, title: 'City Center Banquet', price: 2500, images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'] },
      
      { vendor: vendor2Id, cat: photoCatId, subcat: weddingPhotoSubId, title: 'Premium Wedding Photography', price: 800, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80'] },
      { vendor: vendor2Id, cat: photoCatId, subcat: weddingPhotoSubId, title: 'Engagement Photo Session', price: 300, images: ['https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'] },
      { vendor: vendor2Id, cat: photoCatId, subcat: weddingPhotoSubId, title: 'Full Day Coverage', price: 1000, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80'] },
      { vendor: vendor2Id, cat: photoCatId, subcat: null, title: 'Birthday Photography', price: 250, images: ['https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'] },
      { vendor: vendor2Id, cat: photoCatId, subcat: null, title: 'Corporate Event Photography', price: 600, images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'] },
      { vendor: vendor2Id, cat: photoCatId, subcat: weddingPhotoSubId, title: 'Pre-wedding Shoot', price: 400, images: ['https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'] }
    ];

    for (let s of servicesToInsert) {
      const sRes = await db.query(`
        INSERT INTO services (vendor_id, category_id, subcategory_id, title, description, base_price, city, avg_rating, review_count)
        VALUES ($1, $2, $3, $4, 'Professional service tailored for your needs in Jordan.', $5, 'Amman', 4.5, 10)
        RETURNING service_id;
      `, [s.vendor, s.cat, s.subcat, s.title, s.price]);
      
      const serviceId = sRes.rows[0].service_id;
      
      await db.query(`
        INSERT INTO service_images (service_id, image_url, is_primary, sort_order)
        VALUES 
          ($1, $2, true, 0),
          ($1, $3, false, 1)
      `, [serviceId, s.images[0], s.images[1]]);
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
