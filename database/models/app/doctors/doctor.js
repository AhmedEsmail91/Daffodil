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
      this.hasMany(models.DoctorSchedule, {
        foreignKey: 'doctor_id',
        as: 'schedules'
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
      allowNull: true,
      references: {
        model: 'Specialties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio_en: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bio_ar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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