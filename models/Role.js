const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define("role", {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role_name: { type: DataTypes.STRING, allowNull: false },
  role_desc: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: "Active" }
}, { timestamps: false });

module.exports = Role;
