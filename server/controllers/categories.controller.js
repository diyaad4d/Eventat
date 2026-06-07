const pool = require('../db');

// GET /api/categories
// Returns all active categories with their active subcategories and service counts
const getAllCategories = async (req, res, next) => {
  try {
    // Single efficient query using Subqueries to avoid Cartesian Product (N+1 avoided)
    const result = await pool.query(`
      SELECT
        c.category_id,
        c.name,
        c.slug,
        c.description,
        c.icon_name,
        c.image_url,
        c.sort_order,
        c.is_active,
        (SELECT COUNT(*) FROM services s WHERE s.category_id = c.category_id AND s.is_active = true) AS services_count,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'subcategory_id', sc.subcategory_id,
                'name',           sc.name,
                'slug',           sc.slug,
                'sort_order',     sc.sort_order,
                'is_active',      sc.is_active
              ) ORDER BY sc.sort_order ASC, sc.name ASC
            )
            FROM subcategories sc
            WHERE sc.category_id = c.category_id AND sc.is_active = true
          ),
          '[]'::json
        ) AS subcategories
      FROM categories c
      WHERE c.is_active = true
      ORDER BY c.sort_order ASC, c.name ASC
    `);

     // example : 
  /*
        {
      "category_id": 1,
      "name": "Venues",
      "services_count": 15,
      "subcategories": [
        { "name": "Hotels", "slug": "hotels" },
        { "name": "Halls", "slug": "halls" }
      ]
    }
  */

    res.set('Cache-Control', 'public, max-age=300');

    return res.status(200).json({
      success: true,
      data: {
        categories: result.rows
      }
    });


    
    // example for result.rows to understand :

    /*
              [
      {
        "category_id": 1,
        "name": "Venues",
        "slug": "venues",
        "description": "Halls and hotels for your events",
        "icon_name": "building",
        "image_url": "venues.jpg",
        "sort_order": 1,
        "is_active": true,
        "services_count": 15,
        "subcategories": [
          {
            "subcategory_id": 101,
            "name": "Hotels",
            "slug": "hotels",
            "sort_order": 1,
            "is_active": true
          },
          {
            "subcategory_id": 102,
            "name": "Wedding Halls",
            "slug": "wedding-halls",
            "sort_order": 2,
            "is_active": true
          }
        ]
      },
      {
        "category_id": 2,
        "name": "Catering",
        "slug": "catering",
        "description": "Delicious food for every occasion",
        "icon_name": "utensils",
        "image_url": "catering.jpg",
        "sort_order": 2,
        "is_active": true,
        "services_count": 8,
        "subcategories": [] 
      }
    ]
    */

  } catch (err) {
    next(err);
  }
};




// GET /api/categories/:id/subcategories
// :id can be an integer (category_id) or a string (slug)
const getCategorySubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSlug = isNaN(id);

    // Fetch the parent category
    const catResult = await pool.query(
      `SELECT category_id, name, slug, description, icon_name, image_url, is_active
       FROM categories
       WHERE ${isSlug ? 'slug = $1' : 'category_id = $1'} AND is_active = true`,
      [isSlug ? id : parseInt(id, 10)]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    const category = catResult.rows[0];

    // Fetch active subcategories with service count
    const subResult = await pool.query(
      `SELECT
         sc.subcategory_id,
         sc.name,
         sc.slug,
         sc.sort_order,
         sc.is_active,
         COUNT(s.service_id) FILTER (WHERE s.is_active = true) AS services_count
       FROM subcategories sc
       LEFT JOIN services s
         ON s.subcategory_id = sc.subcategory_id
       WHERE sc.category_id = $1 AND sc.is_active = true
       GROUP BY sc.subcategory_id
       ORDER BY sc.sort_order ASC, sc.name ASC`,
      [category.category_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        category,
        subcategories: subResult.rows
      }
    });

     // example for result.rows to understand :
    /*
          {
        "success": true,
        "data": {
          "category": {
            "category_id": 1,
            "name": "Venues",
            "slug": "venues",
            "description": "قاعات وفنادق للمناسبات",
            "icon_name": "building-icon",
            "image_url": "venues.jpg",
            "is_active": true
          },
          "subcategories": [
            {
              "subcategory_id": 10,
              "name": "Hotels",
              "slug": "hotels",
              "sort_order": 1,
              "is_active": true,
              "services_count": "5"
            },
            {
              "subcategory_id": 11,
              "name": "Wedding Halls",
              "slug": "wedding-halls",
              "sort_order": 2,
              "is_active": true,
              "services_count": "12"
            }
          ]
        }
      }
     */


  } catch (err) {
    next(err);
  }
};




// GET /api/event-types
// Returns all active event types ordered by id
const getEventTypes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT event_type_id, name, slug, description, image_url, is_active
      FROM event_types
      WHERE is_active = true
      ORDER BY event_type_id ASC
    `);

    res.set('Cache-Control', 'public, max-age=600');

    return res.status(200).json({
      success: true,
      data: {
        eventTypes: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};




module.exports = {
  getAllCategories,
  getCategorySubcategories,
  getEventTypes,
};
