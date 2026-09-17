const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('lead_assigned', 'listing_status_changed', 'general'),
      defaultValue: 'general',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  }
);

module.exports = Notification;

