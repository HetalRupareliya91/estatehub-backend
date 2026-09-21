const { Op } = require('sequelize');
const { Appointment, User, Lead, Listing } = require('../models');

// @route GET /api/appointments
async function getAppointments(req, res, next) {
  try {
    const { agentId, status, upcoming } = req.query;
    const where = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;
    if (upcoming === 'true') where.startTime = { [Op.gte]: new Date() };

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name'] },
        { model: Lead, as: 'lead', attributes: ['id', 'name'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title'] },
      ],
      order: [['startTime', 'ASC']],
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/appointments/:id
async function getAppointmentById(req, res, next) {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name'] },
        { model: Lead, as: 'lead' },
        { model: Listing, as: 'listing' },
      ],
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/appointments
async function createAppointment(req, res, next) {
  try {
    const { title, description, startTime, endTime, leadId, listingId, agentId } = req.body;
    if (!title || !startTime) {
      return res.status(400).json({ message: 'title and startTime are required' });
    }

    const appointment = await Appointment.create({
      title, description, startTime, endTime, leadId, listingId,
      agentId: agentId || req.user.id,
    });
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/appointments/:id
async function updateAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const fields = ['title', 'description', 'startTime', 'endTime', 'status', 'leadId', 'listingId', 'agentId'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) appointment[field] = req.body[field];
    });

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/appointments/:id
async function deleteAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.destroy();
    res.json({ message: 'Appointment removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

