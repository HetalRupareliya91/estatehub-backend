const { Op } = require('sequelize');
const { Lead, User, Listing, sequelize } = require('../models');

// @route GET /api/leads
// Supports optional filters: stage, source, interestType, agentId, search
// Supports pagination: page (default 1), limit (default 10, max 100)
async function getLeads(req, res, next) {
  try {
    const { stage, source, interestType, agentId, search } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = {};

    if (stage) where.stage = stage;
    if (source) where.source = source;
    if (interestType) where.interestType = interestType;
    if (agentId) where.agentId = agentId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Lead.findAndCountAll({
      where,
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'address'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true, // keep the count accurate with the joins above
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.max(Math.ceil(count / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/leads/pipeline
// Returns lead counts grouped by stage, useful for a CRM kanban/dashboard view
async function getPipelineSummary(req, res, next) {
  try {
    const counts = await Lead.findAll({
      attributes: ['stage', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['stage'],
    });
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/leads/:id
async function getLeadById(req, res, next) {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'listing' },
      ],
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/leads
async function createLead(req, res, next) {
  try {
    const { name, email, phone, source, interestType, budget, notes, agentId, listingId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Lead name is required' });
    }

    const lead = await Lead.create({
      name, email, phone, source, interestType, budget, notes, listingId,
      agentId: agentId || req.user.id,
    });

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/leads/:id
async function updateLead(req, res, next) {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const fields = [
      'name', 'email', 'phone', 'source', 'stage', 'interestType',
      'budget', 'notes', 'agentId', 'listingId',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save();
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/leads/:id
async function deleteLead(req, res, next) {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.destroy();
    res.json({ message: 'Lead removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeads,
  getPipelineSummary,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
