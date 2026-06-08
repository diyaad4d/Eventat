const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_m9SGbAdED7OC@ep-morning-leaf-ah4pgeuj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function check() {
  const res = await pool.query('SELECT event_type_id FROM event_types');
  const eventTypes = res.rows.map(r => r.event_type_id);
  
  const servicesRes = await pool.query('SELECT service_id FROM services s WHERE (SELECT COUNT(*) FROM service_event_types set2 WHERE set2.service_id = s.service_id) = 0');
  
  for (const s of servicesRes.rows) {
    for (const et of eventTypes) {
      await pool.query('INSERT INTO service_event_types (service_id, event_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [s.service_id, et]);
    }
  }
  console.log('Fixed services:', servicesRes.rows.map(s => s.service_id));
  pool.end();
}
check().catch(console.error);
