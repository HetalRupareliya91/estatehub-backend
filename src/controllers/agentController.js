const { User, Lead, Listing } = require('../models');

// @route GET /api/agents
async function getAgents(req, res, next) {
  try {
    const agents = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(agents);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/agents/:id
async function getAgentById(req, res, next) {
  try {
    const agent = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      include: [
        { model: Listing, as: 'listings' },
        { model: Lead, as: 'leads' },
      ],
    });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/agents/:id
async function updateAgent(req, res, next) {
  try {
    const agent = await User.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    // Only admins can change roles; agents may update their own basic info.
    const isSelf = req.user.id === agent.id;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, phone, password, role } = req.body;
    if (name !== undefined) agent.name = name;
    if (phone !== undefined) agent.phone = phone;
    if (password) agent.password = password;
    if (role !== undefined && req.user.role === 'admin') agent.role = role;

    await agent.save();
    res.json(agent.toSafeObject());
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/agents/:id
async function deleteAgent(req, res, next) {
  try {
    const agent = await User.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    await agent.destroy();
    res.json({ message: 'Agent removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAgents, getAgentById, updateAgent, deleteAgent };
