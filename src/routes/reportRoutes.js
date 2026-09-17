const express = require('express');
const {
  getRevenueSummary, getLeadsBySource, getMonthlyConversions, getAgentPerformance,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/revenue', getRevenueSummary);
router.get('/leads-by-source', getLeadsBySource);
router.get('/conversions', getMonthlyConversions);
router.get('/agent-performance', getAgentPerformance);

module.exports = router;

