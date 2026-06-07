const express = require('express');
const router = express.Router();
const categoriesCtrl = require('../controllers/categories.controller');

// All public — no auth middleware needed
router.get('/', categoriesCtrl.getEventTypes);

module.exports = router;
