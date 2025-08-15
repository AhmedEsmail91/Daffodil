'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      this.hasMany(models.User, {
        foreignKey: 'role_id',
        as: 'users'
      });
      this.hasMany(models.RolePermission, {
        foreignKey: 'role_id',
        as: 'rolePermissions'
      });
      this.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'role_id',
        otherKey: 'permission_id',
        as: 'permissions'
      });
    }
  }
  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name_en: DataTypes.STRING,
    name_ar: DataTypes.STRING,
    guard_name: {
      type: DataTypes.ENUM('api', 'app'),
      defaultValue: 'api'
    },

  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'Role',
  });
  return Role;
};