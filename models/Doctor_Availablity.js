const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const DoctorAvailability = sequelize.define("doctor_availability", {

  doctor_availability_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },

  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },


  slot_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_on: {
    type: DataTypes.DATE,
    allowNull: true
  },

  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  fees : {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }

}, {
  tableName: "doctor_availability",
  timestamps: false
});

module.exports = DoctorAvailability;
