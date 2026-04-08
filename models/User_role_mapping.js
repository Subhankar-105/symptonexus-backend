const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserRoleMapping = sequelize.define("user_role_mapping", {
  user_role_mapping_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Active"
  }

}, {
  timestamps: false
});

module.exports = UserRoleMapping;
