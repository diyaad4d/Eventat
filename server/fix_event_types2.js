const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_m9SGbAdED7OC@ep-morning-leaf-ah4pgeuj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function check() {
  const etRes = await pool.query('SELECT * FROM event_types');
  const servicesRes = await pool.query('SELECT service_id FROM services');
  
  for (const s of servicesRes.rows) {
    const count = (s.service_id % 2) + 1; // 1 or 2
    const etId = etRes.rows[s.service_id % etRes.rows.length].event_type_id;
    const etId2 = etRes.rows[(s.service_id + 1) % etRes.rows.length].event_type_id;
    
    await pool.query('INSERT INTO service_event_types (service_id, event_type_id) VALUES ($1, $2)', [s.service_id, etId]);
    if (count === 2) {
      await pool.query('INSERT INTO service_event_types (service_id, event_type_id) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT service_event_types_pkey DO NOTHING', [s.service_id, etId2]);
    }
  }
  console.log('Reassigned event types to services.');
  pool.end();
}
check().catch(console.error);
