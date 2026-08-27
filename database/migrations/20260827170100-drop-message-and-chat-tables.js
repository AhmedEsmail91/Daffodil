'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Chat is now handled by Firestore instead of Postgres.
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('Chats');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "If authenticated patient, link to Patient table",
      },
      patientAliasName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Optional alias name for patient to make admin search without exposing real identity",
      },
      status: {
        type: Sequelize.ENUM("open", "closed"),
        defaultValue: "open",
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Optional metadata (device, browser info, etc.)",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
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
        allowNull: false,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  }
};
