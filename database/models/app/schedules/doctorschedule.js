'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DoctorSchedule extends Model {
    static associate(models) {
      this.belongsTo(models.Doctor, {
        foreignKey: 'doctor_id',
        as: 'doctor'
      });
      this.hasMany(models.Appointment, {
        foreignKey: 'schedule_id',
        as: 'appointments'
      });
    }
  }
  DoctorSchedule.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Doctors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    to: {
      type: DataTypes.DATE,
      allowNull: false
    },
    online_cases_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_appointments:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status:{
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: true
    },
    deletedAt:{
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    timestamps: true,
    modelName: 'DoctorSchedule',
  });
  return DoctorSchedule;
};