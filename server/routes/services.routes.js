const express      = require('express');
const router       = express.Router();
const servicesCtrl = require('../controllers/services.controller');

// Route order matters — more specific literal paths MUST come before /:id
// so Express does not treat them as :id parameters.
router.get('/featured',            servicesCtrl.getFeaturedServices);
router.get('/by-event-type/:slug', servicesCtrl.getServicesByEventType);
router.get('/',                    servicesCtrl.getAllServices);
router.get('/:id',                 servicesCtrl.getServiceById);

module.exports = router;
