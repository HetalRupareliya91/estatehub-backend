const express = require('express');
const { getSettings, updateSetting } = require('../controllers/settingController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/:key', requireRole('admin'), updateSetting);

module.exports = router;

