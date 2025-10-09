'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Message, {
      foreignKey: "chat_id",
      as: "messages",
      onDelete: "CASCADE",
    });

    // Optional: If you have User model
      
      this.belongsTo(models.User, {
        foreignKey: "patient_id",
        as: "patient",
      });
    
    }
  }
  Chat.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientAliasName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Optional alias name for patient to make admin search without exposing real identity",
      },
      patient_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "If authenticated patient, link to Patient table",
      },
      status: {
        type: DataTypes.ENUM("open", "closed"),
        defaultValue: "open",
      },
      closed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Optional metadata (device, browser info, etc.)",
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
      sequelize,
      modelName: 'Chat',
      timestamps: true,
    });
  return Chat;
};