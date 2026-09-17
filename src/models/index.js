const sequelize = require('../config/db');
const User = require('./User');
const Lead = require('./Lead');
const Listing = require('./Listing');
const Notification = require('./Notification');
const Setting = require('./Setting');

// An agent (User) can have many listings and many leads assigned to them.
User.hasMany(Listing, { foreignKey: 'agentId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

User.hasMany(Lead, { foreignKey: 'agentId', as: 'leads' });
Lead.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

// A lead may be interested in a specific listing.
Listing.hasMany(Lead, { foreignKey: 'listingId', as: 'interestedLeads' });
Lead.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Notifications belong to the user who receives them.
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Lead,
  Listing,
  Notification,
  Setting,
};

