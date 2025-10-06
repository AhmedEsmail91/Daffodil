'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Chat, {
      foreignKey: "chat_id",
      as: "chat",
      onDelete: "CASCADE",
    });
    }
  }
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chat_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "chats",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sender_type: {
        type: DataTypes.ENUM("patient", "admin", "system"),
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "References admin or patient depending on sender_type",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pinned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Optional message metadata (attachments, reactions, etc.)",
      },
    },
    {
      sequelize,
      modelName: "Message",
      timestamps: true
  });
  return Message;
};