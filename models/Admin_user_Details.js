const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUserDetails = sequelize.define('admin_user_details', {
  admin_user_details_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  admin_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  permanent_address_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  current_address_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  timestamps: false
});

module.exports = AdminUserDetails;