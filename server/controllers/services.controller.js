const db = require('../db');

// HELPER — primary image subquery (returns a single image_url for a service)
const primaryImageSubquery = (alias = 's') => `(
  SELECT si.image_url
  FROM service_images si
  WHERE si.service_id = ${alias}.service_id
  ORDER BY si.is_primary DESC, si.sort_order ASC
  LIMIT 1
)`;


// HELPER — shared SELECT + JOINs used by listing endpoints
const baseServiceSelect = () => `
  SELECT
    s.service_id,
    s.vendor_id,
    s.category_id,
    s.subcategory_id,
    s.title,
    s.description,
    s.base_price,
    s.pricing_unit,
    s.service_location,
    s.city,
    s.capacity,
    s.is_active,
    s.created_at,
    s.updated_at,
    ${primaryImageSubquery('s')} AS primary_image_url,
    vp.company_name AS vendor_name,
    u.user_id                               AS vendor_user_id,
    c.name                                  AS category_name,
    c.slug                                  AS category_slug,
    sc.name                                 AS subcategory_name,
    s.avg_rating,
    s.review_count,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'event_type_id', et.event_type_id,
            'name',          et.name,
            'slug',          et.slug
          )
        )
        FROM service_event_types set2
        JOIN event_types et ON set2.event_type_id = et.event_type_id
        WHERE set2.service_id = s.service_id
      ),
      '[]'::json
    ) AS event_types
  FROM services s
  LEFT JOIN vendor_profiles vp  ON s.vendor_id = vp.vendor_id
  LEFT JOIN users u             ON s.vendor_id = u.user_id
  LEFT JOIN categories c        ON s.category_id = c.category_id
  LEFT JOIN subcategories sc    ON s.subcategory_id = sc.subcategory_id
`;



// ENDPOINT 1 — GET /api/services
const getAllServices = async (req, res, next) => {
  try {
    const {
      keyword, eventType, subcategory, search, min_price, max_price, sort = 'recommended', date,
    } = req.query;

    const searchTerm = keyword || search || '';

    const categories = req.query.categories ? req.query.categories.split(',').map(s => s.trim()).filter(Boolean) : [];
    const cities = req.query.cities ? req.query.cities.split(',').map(s => s.trim()).filter(Boolean) : [];

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));

    if (min_price && isNaN(parseFloat(min_price))) 
      return res.status(400).json({ success: false, error: 'min_price must be a positive number.' });
    if (max_price && isNaN(parseFloat(max_price))) 
      return res.status(400).json({ success: false, error: 'max_price must be a positive number.' });
    if (min_price && max_price && parseFloat(max_price) < parseFloat(min_price))
       return res.status(400).json({ success: false, error: 'max_price must be >= min_price.' });

    const allowedSorts = ['recommended', 'price_asc', 'price_desc', 'rating', 'newest'];

    if (!allowedSorts.includes(sort))
       return res.status(400).json({ success: false, error: `sort must be one of: ${allowedSorts.join(', ')}.` });

    const conditions = ['s.is_active = true', 'vp.registration_status = $1'];
    const params     = ['approved'];

    if (categories.length > 0) {
      params.push(categories);
      conditions.push(`c.slug = ANY($${params.length}::text[])`);
    }

    if (subcategory && subcategory.trim()) {
      params.push(subcategory.trim());
      conditions.push(`sc.name = $${params.length}`);
    }

    if (searchTerm && searchTerm.trim()) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      conditions.push(`(LOWER(s.title) LIKE $${params.length} OR LOWER(s.description) LIKE $${params.length})`);
    }

    if (min_price) { params.push(parseFloat(min_price)); conditions.push(`s.base_price >= $${params.length}`); }
    if (max_price) { params.push(parseFloat(max_price)); conditions.push(`s.base_price <= $${params.length}`); }

    if (cities.length > 0) {
      params.push(cities);
      conditions.push(`LOWER(s.city) = ANY(SELECT LOWER(unnest($${params.length}::text[])))`);
    }

    const minRating = parseFloat(req.query.rating);
    if (!isNaN(minRating) && minRating > 0) {
      params.push(minRating);
      conditions.push(`s.avg_rating >= $${params.length}`);
    }

    if (eventType && eventType.trim()) {
      params.push(eventType.trim().toLowerCase());
      conditions.push(`
        EXISTS (
          SELECT 1 FROM service_event_types set2
          JOIN event_types et ON set2.event_type_id = et.event_type_id
          WHERE set2.service_id = s.service_id AND LOWER(et.slug) = $${params.length}
        )
      `);
    }

    const orderByMap = {
      recommended: 's.avg_rating DESC, s.review_count DESC',
      price_asc:   's.base_price ASC',
      price_desc:  's.base_price DESC',
      rating:      's.avg_rating DESC, s.review_count DESC',
      newest:      's.created_at DESC',
    };
    const orderBy = orderByMap[sort];

    const offset = (page - 1) * limit;
    params.push(limit);  const limitParam  = params.length;
    params.push(offset); const offsetParam = params.length;

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    
    const sql = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM (
        ${baseServiceSelect()}
        ${whereClause}
      ) AS paginated
      ORDER BY ${orderBy}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await db.query(sql, params);
    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const services = result.rows.map(({ total_count, ...row }) => row);

    return res.status(200).json({
      success: true,
      data: {
        services,
        pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        filters: { keyword: searchTerm, eventType, categories, subcategory, min_price, max_price, cities, rating: req.query.rating, date, sort },
      }
    });
  } catch (err) {
    next(err);
  }
};



// ENDPOINT 2 — GET /api/services/featured
const getFeaturedServices = async (req, res, next) => {
  try {
    
    const sql = `
      SELECT *
      FROM (
        ${baseServiceSelect()}
        WHERE s.is_active = true AND vp.registration_status = 'approved'
      ) AS featured
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 8
    `;
    const result = await db.query(sql);
    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ success: true, data: { services: result.rows } });
  } catch (err) {
    next(err);
  }
};




// ENDPOINT 3 — GET /api/services/:id
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid service ID.' });
    const serviceId = parseInt(id, 10);

    //  Optimized Query without GROUP BY and slow JOINs
    const serviceRes = await db.query(`
      SELECT * FROM (
        ${baseServiceSelect()}
        WHERE s.service_id = $1 AND s.is_active = true AND vp.registration_status = 'approved'
      ) AS single_service
    `, [serviceId]);

    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
    }

    const row = serviceRes.rows[0];

    const service = {
      service_id:        row.service_id,
      title:             row.title,
      description:       row.description,
      base_price:        row.base_price,
      pricing_unit:      row.pricing_unit,
      service_location:  row.service_location,
      city:              row.city,
      capacity:          row.capacity,
      is_active:         row.is_active,
      created_at:        row.created_at,
      updated_at:        row.updated_at,
      primary_image_url: row.primary_image_url,
      avg_rating:        parseFloat(row.avg_rating),
      review_count:      row.review_count,
      event_types:       row.event_types,
      vendor: {
        vendor_id:           row.vendor_user_id,
        name:                row.vendor_name,
        city:                row.city,
        registration_status: 'approved',
      },
      category: { category_id: row.category_id, name: row.category_name, slug: row.category_slug },
      subcategory: row.subcategory_id ? { subcategory_id: row.subcategory_id, name: row.subcategory_name, slug: row.subcategory_name } : null,
    };


    const imagesRes = await db.query(`
      SELECT 
      image_id, image_url, is_primary, sort_order FROM service_images 
      WHERE service_id = $1 ORDER BY is_primary DESC, sort_order ASC`, 
      [serviceId]
    );


    const reviewsRes = await db.query(`
      SELECT r.review_id, r.rating, r.review_text, r.created_at, u.full_name AS reviewer_name 
      FROM reviews r 
      LEFT JOIN users u ON r.customer_id = u.user_id 
      WHERE r.service_id = $1 ORDER BY r.created_at DESC LIMIT 5`, 
      [serviceId]
    );
    

    const similarRes = await db.query(`
      SELECT * FROM (
        ${baseServiceSelect()}
        WHERE s.category_id = $1 AND s.service_id != $2 AND s.is_active = true AND vp.registration_status = 'approved'
      ) AS similar_services
      ORDER BY avg_rating DESC LIMIT 8
    `, [row.category_id, serviceId]);

    return res.status(200).json(
      { 
        success: true, 
        data: { 
          service, 
          images: imagesRes.rows, 
          reviews: reviewsRes.rows, 
          similarServices: similarRes.rows 
        }
       }
    );
  } catch (err) {
    next(err);
  }
};






// ENDPOINT 4 — GET /api/vendors/:vendorId/services
const getVendorPublicServices = async (req, res, next) => {
  try {

    const { vendorId } = req.params;
    if (isNaN(vendorId)) return res.status(400).json({ success: false, error: 'Invalid vendor ID.' });
    const vendorIdInt = parseInt(vendorId, 10);

    const vendorRes = await db.query(`
      SELECT
        vp.vendor_id, vp.company_name, vp.city, vp.company_description, vp.registration_status, u.full_name, u.created_at AS member_since,
        ROUND(COALESCE((SELECT AVG(avg_rating) FROM services sv 
        WHERE sv.vendor_id = vp.vendor_id), 0)::numeric, 1) AS avg_rating,
        COALESCE((SELECT SUM(review_count) FROM services sv 
        WHERE sv.vendor_id = vp.vendor_id), 0)::int AS review_count,
        (SELECT COUNT(*) FROM services sv 
        WHERE sv.vendor_id = vp.vendor_id AND sv.is_active = true)::int AS total_services
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.vendor_id = u.user_id
      WHERE vp.vendor_id = $1 AND vp.registration_status = 'approved'
    `, [vendorIdInt]);

    if (vendorRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Vendor not found.', code: 'VENDOR_NOT_FOUND' });
    const vendorRow = vendorRes.rows[0];

    const servicesRes = await db.query(`
      SELECT * FROM (
        ${baseServiceSelect()}
        WHERE s.vendor_id = $1 AND s.is_active = true AND vp.registration_status = 'approved'
      ) AS vendor_services
      ORDER BY created_at DESC
    `, [vendorIdInt]);

    return res.status(200).json({
      success: true,
      data: {
        vendor: {
          vendor_id: vendorRow.vendor_id, name: vendorRow.company_name || vendorRow.full_name, city: vendorRow.city, about: vendorRow.company_description,
          avg_rating: parseFloat(vendorRow.avg_rating), review_count: vendorRow.review_count, total_services: vendorRow.total_services,
          member_since: vendorRow.member_since, registration_status: vendorRow.registration_status,
        },
        services: servicesRes.rows, totalServices: servicesRes.rows.length,
      }
    });
  } catch (err) {
    next(err);
  }
};




// ENDPOINT 5 — GET /api/services/by-event-type/:slug
const getServicesByEventType = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== 'string') return res.status(400).json({ success: false, error: 'Event type slug is required.' });

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;
    const { category, subcategory, search, min_price, max_price, cities, sort = 'recommended' } = req.query;

    const etResult = await db.query(`SELECT event_type_id, name, slug, description, image_url FROM event_types WHERE LOWER(slug) = LOWER($1)`, [slug]);
    if (etResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Event type not found.', code: 'EVENT_TYPE_NOT_FOUND' });
    const eventTypeRow = etResult.rows[0];

    const conditions = [
      's.is_active = true',
      'vp.registration_status = $1',
      `EXISTS (SELECT 1 FROM service_event_types set2 WHERE set2.service_id = s.service_id AND set2.event_type_id = $2)`
    ];
    const params = ['approved', eventTypeRow.event_type_id];

    if (category && category.trim()) {
      const cats = category.split(',').map(s => s.trim()).filter(Boolean);
      if (cats.length > 0) { params.push(cats); conditions.push(`c.slug = ANY($${params.length}::text[])`); }
    }
    if (subcategory && subcategory.trim()) { params.push(subcategory.trim()); conditions.push(`sc.name = $${params.length}`); }
    if (search && search.trim()) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(s.title) LIKE $${params.length} OR LOWER(s.description) LIKE $${params.length})`);
    }
    if (min_price) { params.push(parseFloat(min_price)); conditions.push(`s.base_price >= $${params.length}`); }
    if (max_price) { params.push(parseFloat(max_price)); conditions.push(`s.base_price <= $${params.length}`); }
    if (cities && cities.trim()) {
      const cityList = cities.split(',').map(s => s.trim()).filter(Boolean);
      if (cityList.length > 0) { params.push(cityList); conditions.push(`LOWER(s.city) = ANY(SELECT LOWER(unnest($${params.length}::text[])))`); }
    }

    const orderByMap = {
      recommended: 's.avg_rating DESC, s.review_count DESC',
      price_asc:   's.base_price ASC',
      price_desc:  's.base_price DESC',
      rating:      's.avg_rating DESC, s.review_count DESC',
      newest:      's.created_at DESC',
    };
    const orderBy = orderByMap[sort] ?? orderByMap.recommended;

    params.push(limit);  const limitParam  = params.length;
    params.push(offset); const offsetParam = params.length;
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const sql = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM (
        ${baseServiceSelect()}
        ${whereClause}
      ) AS paginated
      ORDER BY ${orderBy}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result     = await db.query(sql, params);
    const total      = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    const services   = result.rows.map(({ total_count, ...row }) => row);

    return res.status(200).json({
      success: true,
      data: { eventType: eventTypeRow, services, pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } },
    });
  } catch (err) {
    next(err);
  }
};



module.exports = { 
  getAllServices, 
  getFeaturedServices, 
  getServiceById, 
  getVendorPublicServices, 
  getServicesByEventType 
};