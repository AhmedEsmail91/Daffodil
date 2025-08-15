'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  AccessToken.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: DataTypes.UUID,
    fcm_token: DataTypes.STRING,
    device_id: DataTypes.STRING,
    ip: DataTypes.STRING,
    token: DataTypes.TEXT,
    status: DataTypes.STRING,

  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'AccessToken',
  });
  return AccessToken;
};