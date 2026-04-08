const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  first_name: DataTypes.STRING,
  middle_name: DataTypes.STRING,
  last_name: DataTypes.STRING,

  email: {
    type: DataTypes.STRING,
    field: 'email'
  },

  phone_no: {
    type: DataTypes.STRING,
    validate: {
      is: /^[0-9+]{8,15}$/   //  phone validation belongs here
    }
  },

  status: {
    type: DataTypes.ENUM('Active','Inactive'),
    defaultValue: 'Active'
  },

  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  created_by: DataTypes.STRING

}, {
  tableName: 'patients',
  freezeTableName: true,
  timestamps: false
});

module.exports = Patient;
