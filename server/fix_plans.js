const db = require('./db');

db.query(`
  UPDATE event_plans ep
  SET status = 'confirmed', updated_at = NOW()
  WHERE status = 'submitted'
  AND NOT EXISTS (SELECT 1 FROM event_plan_items epi WHERE epi.event_id = ep.event_id AND epi.vendor_item_status = 'pending')
  AND EXISTS (SELECT 1 FROM event_plan_items epi WHERE epi.event_id = ep.event_id AND epi.vendor_item_status = 'accepted');
`).then(res => {
  console.log('Updated ' + res.rowCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
