'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      this.hasMany(models.Appointment, {
        foreignKey: 'doctor_id',
        as: 'appointments'
      });
      this.belongsTo(models.User, {
        foreignKey: 'patient_id',
        as: 'patient'
      });
    }
  }
  Appointment.init({
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title:{
      type: DataTypes.STRING,
      allowNull: false
    },
    notes:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    images:{
      type: DataTypes.JSONB,
      allowNull: true
    },
    doctor_id:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Doctors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    duration_min:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patient_id:{
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    type:{
      type: DataTypes.ENUM('consultation', 'follow-up', 'emergency'),
      allowNull: false
    },
    appointment_mode:{
      type: DataTypes.ENUM('online', 'in-person'),
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }

  }, {
    sequelize,
    paranoid: true,
    timestamps:true,
    modelName: 'Appointment',
  });
  return Appointment;
};