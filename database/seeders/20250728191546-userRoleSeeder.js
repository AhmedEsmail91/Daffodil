'use strict';
const {Role}=require('../../database/models');
const { v4: uuidv4 } = require('uuid');
const bcrypt=require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const adminRole=await Role.findOne({where:{name_en:"admin"}});
    await queryInterface.bulkInsert('Users',[{
      id: uuidv4(),
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('Qw123456789@#$',10),
      role_id: adminRole.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  async down (queryInterface, Sequelize) {
    // Remove the user
    await queryInterface.bulkDelete('Users', { email: 'admin@gmail.com' });
  }
};
