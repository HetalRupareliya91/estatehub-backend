const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Appointment extends Model {}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    leadId: {
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
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
  }
);

module.exports = Appointment;

