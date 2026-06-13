const db = require('./db');

const addPaidStatus = async () => {
  try {
    await db.query(`
      ALTER TABLE event_plans DROP CONSTRAINT IF EXISTS event_plans_status_check;
      ALTER TABLE event_plans ADD CONSTRAINT event_plans_status_check 
      CHECK (status IN ('draft', 'submitted', 'confirmed', 'paid', 'completed', 'cancelled'));
      
      ALTER TABLE event_plan_items DROP CONSTRAINT IF EXISTS event_plan_items_vendor_item_status_check;
      ALTER TABLE event_plan_items ADD CONSTRAINT event_plan_items_vendor_item_status_check 
      CHECK (vendor_item_status IN ('pending', 'accepted', 'rejected', 'paid', 'completed', 'cancelled'));
    `);
    console.log('Successfully updated status constraints to include "paid"');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    process.exit(0);
  }
};

addPaidStatus();
