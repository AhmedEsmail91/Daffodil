'use strict';
const bcrypt = require("bcrypt");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.AccessToken, {
        foreignKey: 'user_id',
        as: 'accessTokens'
      });
      this.hasMany(models.Otp, {
        foreignKey: 'user_id',
        as: 'otps'
      });
      this.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });
      this.hasOne(models.Doctor, {
        foreignKey: 'user_id',
        as: 'doctor'
      });
      this.hasMany(models.ProviderAccount, {
        foreignKey: 'user_id',
        as: 'providerAccounts'
      });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    contact: DataTypes.STRING,
    preferred_lang: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'inactive', 'banned'),
    role_id: DataTypes.UUID,
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    modelName: 'User',
  }).addHook('beforeCreate', (user, options) => {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, 10); // Hash the password before saving
    }
  }).addHook('beforeUpdate', (user, options) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, 10); // Hash the password before updating
    }
  });
  return User;
};

