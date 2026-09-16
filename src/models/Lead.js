const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Lead extends Model {}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('website', 'referral', 'walk_in', 'phone', 'social_media', 'other'),
      defaultValue: 'other',
    },
    stage: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'),
      defaultValue: 'new',
    },
    interestType: {
      type: DataTypes.ENUM('buy', 'sell', 'rent'),
      defaultValue: 'buy',
    },
    budget: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Lead',
    tableName: 'leads',
    timestamps: true,
  }
);

module.exports = Lead;
