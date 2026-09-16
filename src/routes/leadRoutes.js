const express = require('express');
const {
  getLeads, getPipelineSummary, getLeadById, createLead, updateLead, deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.get('/pipeline', getPipelineSummary);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
