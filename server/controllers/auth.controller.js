const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');



exports.register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { 
      email, 
      password, 
      username,
      full_name, 
      role , 
      phone,
      // Vendor specific fields:
      vendor_type,
      company_name, 
      company_description, 
      city,
      address,
      iban,
      social_links
    } = req.body;

    const rawCategory = req.body.category_id ?? req.body.preferred_category_id ?? req.body.category;
    const preferred_category_id = rawCategory ? parseInt(rawCategory, 10) : null;

    if (rawCategory && isNaN(preferred_category_id)) {
      client.release();
      return res.status(400).json({
        success: false,
        error: 'Invalid category selection.',
        fields: { category: 'Please select a valid category.' },
      });
    }

    if (preferred_category_id) {
      const catCheck = await client.query(
        `SELECT category_id FROM categories WHERE category_id = $1 AND is_active = true`,
        [preferred_category_id]
      );
      if (catCheck.rows.length === 0) {
        client.release();
        return res.status(400).json({
          success: false,
          error: 'Selected category does not exist.',
          fields: { category: 'Please select a valid category.' },
        });
      }
    }

    await client.query('BEGIN');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    // returning for لا تثق أبداً في البيانات التي أرسلتها للقاعدة، ثق فقط بالبيانات التي أكدت القاعدة أنها حفظتها and also ID 

    const userRes = await client.query(`
      INSERT INTO users (role, username, email, password_hash, full_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, role, username, email, full_name, is_active 
    `, [role, username, email, passwordHash, full_name, phone]);

   const newUser = userRes.rows[0];

    if (role === 'customer') {
      await client.query(`
        INSERT INTO customer_profiles (customer_id, city, address)
        VALUES ($1, $2, $3)
      `, [newUser.user_id, city, address]);
    } else if (role === 'vendor') {

      const socialLinksJson = social_links ? JSON.stringify(social_links) : '[]';
      
      await client.query(`
        INSERT INTO vendor_profiles (
          vendor_id, 
          vendor_type, 
          company_name, 
          city, 
          address, 
          iban,
          company_description, 
          preferred_category_id, 
          social_links
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newUser.user_id, 
        vendor_type,            
        company_name,           
        city,                   
        address,                
        iban,                   
        company_description,    
        preferred_category_id, 
        socialLinksJson        
      ]);

      // Handle document uploads
      if (req.files) {
        const filesToInsert = [];
        if (req.files['commercialRegister']) {
          filesToInsert.push({ type: 'commercial_register', url: `/uploads/documents/${req.files['commercialRegister'][0].filename}` });
        }
        if (req.files['nationalIdFront']) {
          filesToInsert.push({ type: 'national_id_front', url: `/uploads/documents/${req.files['nationalIdFront'][0].filename}` });
        }
        if (req.files['nationalIdBack']) {
          filesToInsert.push({ type: 'national_id_back', url: `/uploads/documents/${req.files['nationalIdBack'][0].filename}` });
        }

        for (const file of filesToInsert) {
          await client.query(`
            INSERT INTO vendor_documents (vendor_id, document_type, file_url)
            VALUES ($1, $2, $3)
          `, [newUser.user_id, file.type, file.url]);
        }
      }
    }

    await client.query('COMMIT');

    // Generate token
    const secret = process.env.JWT_SECRET || 'phase-2-development-fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ userId: newUser.user_id, role: newUser.role }, secret, { expiresIn });

    return res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ success: false, error: 'Email or username already exists' });
    }
    next(err);
  } finally {
    client.release();
  }
};






exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated or banned' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Note: 'last_login_at' is not in schema. We update 'updated_at' instead.
    await pool.query(`UPDATE users SET updated_at = NOW() WHERE user_id = $1`, [user.user_id]);

    let verification_status = null;
    if (user.role === 'vendor') {
      const vendorRes = await pool.query(`SELECT registration_status FROM vendor_profiles WHERE vendor_id = $1`, [user.user_id]);
      if (vendorRes.rows.length > 0) {
        verification_status = vendorRes.rows[0].registration_status;
      }
    }

    const secret = process.env.JWT_SECRET || 'phase-2-development-fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ userId: user.user_id, role: user.role }, secret, { expiresIn });

    const { password_hash, ...userWithoutPassword } = user;
    if (verification_status) {
      userWithoutPassword.verification_status = verification_status;
    }

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};



exports.logout = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};




exports.getMe = async (req, res, next) => {
  try {
    // these from Auth Middleware give me the req.user from token 
    const userId = req.user.userId;
    const role = req.user.role;

    const userRes = await pool.query(`
      SELECT user_id, role, username, email, full_name, phone, preferred_language, is_active, created_at, updated_at 
      FROM users WHERE user_id = $1
    `, [userId]);
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let user = userRes.rows[0];

    // طرد المستخدم إذا تم حظره أو تعطيل حسابه
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated or banned' });
    }

    if (role === 'customer') {
      const profileRes = await pool.query(`SELECT * FROM customer_profiles WHERE customer_id = $1`, [userId]);
      if (profileRes.rows.length > 0) {
        user = { ...user, profile: profileRes.rows[0] };
      }
    } else if (role === 'vendor') {
      const profileRes = await pool.query(`SELECT * FROM vendor_profiles WHERE vendor_id = $1`, [userId]);
      if (profileRes.rows.length > 0) {
        user = { ...user, profile: profileRes.rows[0] };
      }
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};




exports.forgotPassword = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};





exports.resetPassword = async (req, res, next) => {
  try {
    return res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};
