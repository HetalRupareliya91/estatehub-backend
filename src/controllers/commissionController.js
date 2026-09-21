const { Commission, User, Listing } = require('../models');

// @route GET /api/commissions
async function getCommissions(req, res, next) {
  try {
    const { agentId, status } = req.query;
    const where = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;

    const commissions = await Commission.findAll({
      where,
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'address'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(commissions);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/commissions
async function createCommission(req, res, next) {
  try {
    const { listingId, agentId, saleAmount, commissionRate } = req.body;
    if (!saleAmount) return res.status(400).json({ message: 'saleAmount is required' });

    const rate = commissionRate !== undefined ? Number(commissionRate) : 3.0;
    const commissionAmount = (Number(saleAmount) * rate) / 100;

    const commission = await Commission.create({
      listingId,
      agentId: agentId || req.user.id,
      saleAmount,
      commissionRate: rate,
      commissionAmount,
    });

    res.status(201).json(commission);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/commissions/:id/paid
async function markCommissionPaid(req, res, next) {
  try {
    const commission = await Commission.findByPk(req.params.id);
    if (!commission) return res.status(404).json({ message: 'Commission not found' });

    commission.status = 'paid';
    commission.paidAt = new Date();
    await commission.save();

    res.json(commission);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/commissions/:id
async function deleteCommission(req, res, next) {
  try {
    const commission = await Commission.findByPk(req.params.id);
    if (!commission) return res.status(404).json({ message: 'Commission not found' });

    await commission.destroy();
    res.json({ message: 'Commission removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCommissions, createCommission, markCommissionPaid, deleteCommission };

