'use strict';
const {Permission,Role}=require('../models/index.js');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const permissions=await Permission.findAll()
    const adminRoleId = uuidv4();
    const userRoleId = uuidv4();
    const doctorRoleId = uuidv4();

    // Insert the role
    // Check if the role already exists
    const existingRole=await Role.findAll({where:{name_en: { [Op.in]: ['admin', 'user', 'doctor'] }}});

    if (existingRole.length === 0) {
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
      },{
        id: doctorRoleId,
        name_en: 'doctor',
        name_ar: 'طبيب',
        createdAt: new Date(),
        updatedAt: new Date()
      }]
      );
    // ========================
    // Permissions by Role
    // ========================

    // 🔹 Admin (full system control)
    const adminPermissions = [
      // users
      'user-create', 'user-read', 'user-update', 'user-delete',

      // profiles (can manage anyone’s profile)
      'profile-create', 'profile-read', 'profile-update', 'profile-delete',

      // schedules
      'schedule-create', 'schedule-read', 'schedule-update', 'schedule-delete',

      // appointments
      'appointment-create', 'appointment-read', 'appointment-update', 'appointment-delete',

      // specialties
      'specialty-create', 'specialty-read', 'specialty-update', 'specialty-delete',

      // roles & permissions
      'role-create', 'role-read', 'role-update', 'role-delete',
      'permission-read',

      // invoices/payments
      // 'invoice-create', 'invoice-read', 'invoice-update', 'invoice-delete',

      // notifications
      // 'notification-create', 'notification-read', 'notification-update', 'notification-delete',
    ];

    // 🔹 Doctor (manages own patients/schedules)
    const doctorPermissions = [
      // profile (own)
      'profile-read', 'profile-update',

      // schedules (their own)
      'schedule-read', 'schedule-update',

      // appointments (their patients)
      'appointment-read', 'appointment-update',

      // patients (via profile)
      // 'profile-read:any', // limited by business logic: only patients linked to appointments

      // prescriptions & medical records
      // 'prescription-create', 'prescription-read', 'prescription-update',
      // 'medicalRecord-create', 'medicalRecord-read',

      // notifications
      // 'notification-read',
    ];

    // 🔹 Patient (manages their own appointments)
    const patientPermissions = [
      // profile (own)
      'profile-read', 'profile-update',

      // appointments (self-service)
      'appointment-create', 'appointment-read', 'appointment-update', 'appointment-delete',

      // schedules (to check availability)
      'schedule-read',

      // doctors (browse public info only)
      'doctor-read',

      // specialties
      'specialty-read',

      // prescriptions & medical records (own only)
      // 'prescription-read',
      // 'medicalRecord-read',

      // invoices/payments (own only)
      // 'invoice-read',

      // notifications
      // 'notification-read',
    ];

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
      const doctorRolePermissions = permissions.map(permission => ({
      id: uuidv4(),
      role_id: doctorRoleId,
      permission_id: permission.id,
      createdAt: new Date(),
      updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('RolePermissions', [...userRolePermissions,...adminRolePermissions,...doctorRolePermissions]);
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove all role permissions
    await queryInterface.bulkDelete('RolePermissions', null, {});

    await queryInterface.bulkDelete('Roles', null, {});
  }
};
