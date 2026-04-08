const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('doctor', {

    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    doctor_no: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
},

    first_name: DataTypes.STRING,

    middle_name: DataTypes.STRING,

    last_name: DataTypes.STRING,

    email: DataTypes.STRING,

    phone_no: DataTypes.STRING,

    status: {
        type: DataTypes.ENUM('Active', 'Pending', 'Rejected', 'Inactive'),
        allowNull: false,
        defaultValue: 'Pending'
    },

    created_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    created_by: DataTypes.STRING,
     updated_on: {
    type: DataTypes.DATE,
    allowNull: true
  },

  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  updated_on: {
    type: DataTypes.DATE,
    allowNull: true
  },

}, {
    tableName: 'doctors',
    timestamps: false
});

module.exports = Doctor;
