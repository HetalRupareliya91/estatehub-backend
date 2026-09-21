const express = require('express');
const {
  getCommissions, createCommission, markCommissionPaid, deleteCommission,
} = require('../controllers/commissionController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getCommissions);
router.post('/', requireRole('admin'), createCommission);
router.patch('/:id/paid', requireRole('admin'), markCommissionPaid);
router.delete('/:id', requireRole('admin'), deleteCommission);

module.exports = router;

