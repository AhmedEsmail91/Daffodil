'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      images: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      schedule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'DoctorSchedules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      scope_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Scopes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('consultation', 'follow-up', 'emergency'),
        defaultValue: 'consultation',
        allowNull: false
      },
      appointment_mode: {
        type: Sequelize.ENUM('online', 'in-person'),
        defaultValue: 'in-person',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending','scheduled', 'completed', 'canceled'),
        defaultValue:"pending",
        allowNull: false
      },
      turn:{
        type: Sequelize.INTEGER,
        allowNull: true
      },
      extra_data:{
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Appointments');
  }
};