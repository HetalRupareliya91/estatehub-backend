const sequelize = require('../config/db');
const User = require('./User');
const Lead = require('./Lead');
const Listing = require('./Listing');
const Notification = require('./Notification');
const Setting = require('./Setting');
const Appointment = require('./Appointment');
const Task = require('./Task');
const Document = require('./Document');
const ActivityLog = require('./ActivityLog');
const Commission = require('./Commission');

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

// Appointments belong to an agent, and may relate to a lead or listing.
User.hasMany(Appointment, { foreignKey: 'agentId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Appointment.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
Appointment.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Tasks belong to an agent, and may relate to a lead or listing.
User.hasMany(Task, { foreignKey: 'agentId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Task.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
Task.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Activity log entries belong to the user who triggered them.
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activity' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Commissions belong to an agent and a listing.
User.hasMany(Commission, { foreignKey: 'agentId', as: 'commissions' });
Commission.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Commission.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

module.exports = {
  sequelize,
  User,
  Lead,
  Listing,
  Notification,
  Setting,
  Appointment,
  Task,
  Document,
  ActivityLog,
  Commission,
};

