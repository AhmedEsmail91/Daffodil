  'use strict';
  const {
    Model
  } = require('sequelize');
  module.exports = (sequelize, DataTypes) => {
    class Appointment extends Model {
      static associate(models) {
        this.belongsTo(models.DoctorSchedule, {
          foreignKey: 'schedule_id',
          as: 'schedule'
        });
        this.belongsTo(models.User, {
          foreignKey: 'patient_id',
          as: 'patient'
        });
        this.hasOne(models.OnlineMeeting,{
          foreignKey:'appointment_id',
          as:'online_meeting'
        });
        this.belongsTo(models.Scope,{
          foreignKey: 'scope_id',
          as: 'scope'
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
      schedule_id:{type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'DoctorSchedules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      patient_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type:{
        type: DataTypes.ENUM('consultation', 'follow-up', 'emergency'),
        allowNull: false
      },
      appointment_mode:{
        type: DataTypes.ENUM('online', 'in-person'),
        allowNull: false
      },
      status:{
        type: DataTypes.ENUM('pending','scheduled', 'completed', 'canceled'),
        defaultValue: 'pending',
        allowNull: false
      },
      turn:{
        type: DataTypes.INTEGER,
        allowNull: true
      },
      scope_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Scopes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      },
      
      extra_data:{
        type: DataTypes.JSONB,
        allowNull: true
      },

    }, {
      sequelize,
      paranoid: true,
      timestamps:true,
      modelName: 'Appointment',
    });
    return Appointment;
  };