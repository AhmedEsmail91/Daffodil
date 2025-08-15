'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    static associate(models) {
      this.hasMany(models.Doctor, {
        foreignKey: 'specialty_id',
        as: 'doctors'
      });
    }
  }
  Specialty.init({
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name_en: DataTypes.STRING,
    name_ar: DataTypes.STRING,
    description_en: DataTypes.TEXT,
    description_ar: DataTypes.TEXT,
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid:true,
    timestamps: true,
    freezeTableName: true,
    tableName:"Specialties",
    modelName: 'Specialty',
  });
  return Specialty;
};