const db = require('../db');
const { completeEventPlanInternal } = require('../controllers/payment.controller');

// Run every hour
const INTERVAL = 1000 * 60 * 60;

const startAutoCompleteJob = () => {
  console.log('[Job] Auto-complete job initialized. Runs every hour.');
  setInterval(async () => {
    try {
      // console.log('[Job] Running auto-complete check for past events...');
      // Find plans that are 'paid' where MAX(event_date) is 24 hours in the past.
      const res = await db.query(`
        SELECT ep.event_id 
        FROM event_plans ep
        JOIN event_plan_items epi ON ep.event_id = epi.event_id
        WHERE ep.status = 'paid'
        GROUP BY ep.event_id
        HAVING MAX(epi.event_date) < NOW() - INTERVAL '24 hours'
      `);

      for (const row of res.rows) {
        try {
          console.log(`[Job] Auto-completing plan ID ${row.event_id}...`);
          await completeEventPlanInternal(row.event_id);
          console.log(`[Job] Successfully auto-completed plan ID ${row.event_id}.`);
        } catch (err) {
          console.error(`[Job] Error auto-completing plan ID ${row.event_id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[Job] Error running auto-complete check:', err.message);
    }
  }, INTERVAL);
};

module.exports = startAutoCompleteJob;
