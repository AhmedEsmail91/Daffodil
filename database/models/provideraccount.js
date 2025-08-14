'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProviderAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  ProviderAccount.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    user_id:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'SET NULL'
    },
    provider: { type: DataTypes.ENUM('local', 'google'), allowNull: false },
    providerUserId: { type: DataTypes.STRING, allowNull: false },
    accessToken: DataTypes.TEXT,
    refreshToken: DataTypes.TEXT,
    profileJson: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'ProviderAccount',
  });
  return ProviderAccount;
};