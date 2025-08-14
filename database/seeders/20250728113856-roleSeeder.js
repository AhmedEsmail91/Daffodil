'use strict';
const {Permission,Role}=require('../models/index.js');
const { v4: uuidv4 } = require('uuid');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const permissions=await Permission.findAll()
    const adminRoleId = uuidv4();
    const userRoleId = uuidv4();

    // Insert the role
    // Check if the role already exists
    const existingRole=await Role.findOne({where:{name_en:"admin"}});

    if (!existingRole) {
      // Insert the role if it doesn't exist
      await queryInterface.bulkInsert('Roles', 
      [{
        id: adminRoleId,
        name_en: 'admin',
        name_ar: 'المسؤول',
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        id: userRoleId,
        name_en: 'user',
        name_ar: 'المستخدم',
        createdAt: new Date(),
        updatedAt: new Date()
      }]
      );

      // Assign all permissions to the role
      const adminRolePermissions = permissions.map(permission => ({
      id: uuidv4(),
      role_id: adminRoleId,
      permission_id: permission.id,
      createdAt: new Date(),
      updatedAt: new Date()
      }));
      const userRolePermissions = permissions.map(permission => ({
      id: uuidv4(),
      role_id: userRoleId,
      permission_id: permission.id,
      createdAt: new Date(),
      updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('RolePermissions', [...userRolePermissions,...adminRolePermissions]);
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove all role permissions
    await queryInterface.bulkDelete('RolePermissions', null, {});

    await queryInterface.bulkDelete('Roles', { name_en: 'admin' }, {});
  }
};
