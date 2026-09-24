const express = require('express');
const {
  getLeads, getPipelineSummary, getLeadById, createLead, updateLead, deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLeadValidator, updateLeadValidator } = require('../validators/leadValidators');

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.get('/pipeline', getPipelineSummary);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadValidator), createLead);
router.patch('/:id', validate(updateLeadValidator), updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
