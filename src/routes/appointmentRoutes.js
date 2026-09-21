const express = require('express');
const {
  getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;

