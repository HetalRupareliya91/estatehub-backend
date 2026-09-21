const { ActivityLog, User } = require('../models');

// @route GET /api/activity
async function getActivity(req, res, next) {
  try {
    const { entityType, entityId, limit } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const activity = await ActivityLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: limit ? parseInt(limit, 10) : 50,
    });
    res.json(activity);
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivity };

