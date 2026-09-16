const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Listing extends Model {}

Listing.init(
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
    propertyType: {
      type: DataTypes.ENUM('house', 'apartment', 'condo', 'land', 'commercial'),
      defaultValue: 'house',
    },
    status: {
      type: DataTypes.ENUM('available', 'under_offer', 'sold', 'rented', 'off_market'),
      defaultValue: 'available',
    },
    price: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bathrooms: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0,
    },
    areaSqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: true,
  }
);

module.exports = Listing;
