'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Scope extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Appointment, {
        foreignKey: 'scope_id',
        as: 'appointments'
      })
    }
  }
  Scope.init({
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name_en: DataTypes.STRING,
    name_ar: DataTypes.STRING,
    description_en: DataTypes.STRING,
    description_ar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Scope',
    paranoid: true,
    timestamps: true
  });
  return Scope;
};