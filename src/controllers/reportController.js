const { sequelize, Listing, Lead, User } = require('../models');

// @route GET /api/reports/revenue
// Sums listing price grouped by status (a rough view of value under management)
async function getRevenueSummary(req, res, next) {
  try {
    const rows = await Listing.findAll({
      attributes: [
        'status',
        [sequelize.fn('SUM', sequelize.col('price')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/reports/leads-by-source
async function getLeadsBySource(req, res, next) {
  try {
    const rows = await Lead.findAll({
      attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['source'],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/reports/conversions
// Won leads grouped by month
async function getMonthlyConversions(req, res, next) {
  try {
    const rows = await Lead.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('updatedAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { stage: 'won' },
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('updatedAt'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('updatedAt')), 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/reports/agent-performance
async function getAgentPerformance(req, res, next) {
  try {
    const agents = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        { model: Listing, as: 'listings', attributes: ['id', 'status'] },
        { model: Lead, as: 'leads', attributes: ['id', 'stage'] },
      ],
    });

    const performance = agents.map((agent) => {
      const listingsSold = agent.listings.filter((l) => l.status === 'sold').length;
      const leadsWon = agent.leads.filter((l) => l.stage === 'won').length;
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        totalListings: agent.listings.length,
        listingsSold,
        totalLeads: agent.leads.length,
        leadsWon,
      };
    });

    res.json(performance);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRevenueSummary,
  getLeadsBySource,
  getMonthlyConversions,
  getAgentPerformance,
};

