const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Commission extends Model {}

Commission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    saleAmount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 3.0,
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid'),
      defaultValue: 'pending',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Commission',
    tableName: 'commissions',
    timestamps: true,
  }
);

module.exports = Commission;

