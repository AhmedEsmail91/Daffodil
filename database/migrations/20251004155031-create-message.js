'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      chat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sender_type: {
        type: Sequelize.ENUM('patient', 'admin', 'system'),
        allowNull: false,
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'References admin or patient depending on sender_type',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true, // media-only messages (attachments with no caption) have no text content
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pinned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Optional message metadata (attachments, reactions, etc.)',
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      media:{
        type: Sequelize.JSONB,
        allowNull: true
      },
      type:{
        type: Sequelize.ENUM("text", "media"),
        defaultValue: "text",
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};