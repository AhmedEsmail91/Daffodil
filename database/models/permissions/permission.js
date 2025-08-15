'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: 'permission_id',
        as: 'roles'
      });
    }
  }
  Permission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    guard_name: {
      type: DataTypes.ENUM('api', 'app'),
      defaultValue: 'api'
    },

  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'Permission',
  });
  return Permission;
};