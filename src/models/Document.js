const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relatedType: {
      type: DataTypes.ENUM('lead', 'listing'),
      allowNull: true,
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
  }
);

module.exports = Document;

