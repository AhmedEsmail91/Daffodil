'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Doctors', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name_en: {
        type: Sequelize.STRING
      },
      name_ar: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.UUID, // matches your Users table PK type
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      specialty_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Specialties', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      licenseNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bio_ar: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('Doctors');
  }
};