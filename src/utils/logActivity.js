const { ActivityLog } = require('../models');

async function logActivity({ userId, action, entityType, entityId, description }) {
  try {
    await ActivityLog.create({ userId, action, entityType, entityId, description });
  } catch (err) {
    // Activity logging should never break the primary request flow.
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = logActivity;

