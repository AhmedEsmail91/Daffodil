'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });
      this.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        as: 'permission'
      });
    }
  }
  RolePermission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    role_id: DataTypes.UUID,
    permission_id: DataTypes.UUID,

  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'RolePermission',
  });
  return RolePermission;
};