'use strict';
const path = require('path')
const fs = require('fs');
const {
  Permission
} = require('../models/index.js')
const { v4: uuidv4 } = require('uuid');
/** @type {import('sequelize-cli').Migration} */
function getModelFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getModelFilesRecursively(filePath));
    } else if (
      file.endsWith('.js') &&
      !file.startsWith('.') &&
      !file.endsWith('.test.js') &&
      file !== 'index.js'
    ) {
      results.push(filePath);
    }
  });
  return results;
}

/**
 * Generate permissions for all models that don't already exist
 */
const checksModelsName = (existingPermissions) => {
  const modelsPath = path.join(__dirname, '../models');
  const files = getModelFilesRecursively(modelsPath);

  const timestamp = new Date();
  const permissions = [];

  const excludedModels = ['rolepermission', 'otp', 'accesstoken', 'permission'];

  files.forEach(filePath => {
    const modelName = path.basename(filePath, '.js').toLowerCase();
    if (excludedModels.includes(modelName)) return;

    ['create', 'read', 'update', 'delete'].forEach(action => {
      const permissionName = `${modelName}-${action}`;
      const exists = existingPermissions.some(p => p.name === permissionName);
      if (!exists) {
        permissions.push({
          id: uuidv4(),
          name: permissionName,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });
  });
  permissions.push({
    id: uuidv4(),
    name: "chat-manage",
    createdAt: timestamp,
    updatedAt: timestamp
  });
  // NOTE: the DoctorSchedule model file is named "doctorschedule.js", so the
  // generic per-model loop above produces "doctorschedule-*" permissions, not
  // "schedule-*". Routes/routers throughout the app (admin, doctor, patient)
  // gate on the literal "schedule-*" names though, so seed those explicitly.
  ['create', 'read', 'update', 'delete'].forEach(action => {
    const permissionName = `schedule-${action}`;
    const exists = existingPermissions.some(p => p.name === permissionName);
    if (!exists) {
      permissions.push({
        id: uuidv4(),
        name: permissionName,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  });
  return permissions;
};
module.exports = {

  async up(queryInterface, Sequelize) {
    const existingPermissions = await Permission.findAll();
    const permissions = checksModelsName(existingPermissions);
    if(!permissions.length) {
      console.log("No new permissions to add.");
      return;
    }
    await queryInterface.bulkInsert('Permissions', permissions);
  },

  async down(queryInterface, Sequelize) {
    const modelsPath = path.join(__dirname, '../models');
    const files = fs.readdirSync(modelsPath);

    const Op = Sequelize.Op;
    const permissionNames = [];

    files.forEach(file => {
      if (
        file.startsWith('.') ||
        !file.endsWith('.js') ||
        file.includes('.test.js') ||
        file === 'index.js'
      ) {
        return;
      }

      const modelName = path.basename(file, '.js').toLowerCase();
      ['create', 'read', 'update', 'delete'].forEach(action => {
        permissionNames.push(`${modelName}-${action}`);
      });
    });
    await Permission.destroy({
        where: {
          name: {
            [Op.in]: ["socket-read"]
          }
        }
      });
    await queryInterface.bulkDelete('Permissions', {
      name: {
        [Op.in]: permissionNames
      }
    });
    await queryInterface.bulkDelete('Permissions', {
      name: {
        [Op.in]: permissionNames
      }
    });
  }
};