const express = require('express');
const {
  getAgents, getAgentById, updateAgent, deleteAgent,
} = require('../controllers/agentController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAgents);
router.get('/:id', getAgentById);
router.patch('/:id', updateAgent);
router.delete('/:id', requireRole('admin'), deleteAgent);

module.exports = router;
