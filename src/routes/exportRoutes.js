const express = require('express');
const { exportLeads, exportListings, exportCommissions } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/leads.csv', exportLeads);
router.get('/listings.csv', exportListings);
router.get('/commissions.csv', exportCommissions);

module.exports = router;

