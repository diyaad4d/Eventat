const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_m9SGbAdED7OC@ep-morning-leaf-ah4pgeuj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    const usersRes = await pool.query("SELECT user_id, email, username FROM users WHERE role='vendor'");
    console.log('Vendors:', usersRes.rows);

    for (const u of usersRes.rows) {
      await pool.query('DELETE FROM vendor_documents WHERE vendor_id = $1', [u.user_id]);
      
      const q = "INSERT INTO vendor_documents (vendor_id, document_type, file_url) VALUES ($1, 'commercial_register', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'), ($1, 'national_id_front', 'https://picsum.photos/400/250'), ($1, 'national_id_back', 'https://picsum.photos/400/250')";
      
      await pool.query(q, [u.user_id]);
      console.log('Inserted docs for vendor:', u.email);
    }
  } catch (err) {
    console.error('SQL ERROR:', err.message);
  } finally {
    await pool.end();
  }
}
run();
