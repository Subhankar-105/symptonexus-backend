const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  user_type: {
    type: DataTypes.STRING,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('Active', 'Pending', 'Rejected' , 'Inactive'),
    defaultValue: 'Active'
  },
  

  ref_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  created_by: {
    type: DataTypes.STRING
  },

  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  timestamps: false,
  tableName: 'user'   
});


module.exports = User;
