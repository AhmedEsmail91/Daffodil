'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      this.belongsTo(models.Specialty, {
        foreignKey: 'specialty_id',
        as: 'specialty'
      });
      this.hasMany(models.Appointment, {
        foreignKey: 'doctor_id',
        as: 'appointments'
      });
    }
  }
  Doctor.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID, // matches your Users table PK type
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name_ar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specialty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Specialties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    workingHours: {
      type: DataTypes.JSON, // eg: { "Monday": {time:"9am-5pm", credits:5}, "Tuesday": {time:"9am-5pm", credits:3}
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    timestamps: true,
    modelName: 'Doctor',
  });
  return Doctor;
};