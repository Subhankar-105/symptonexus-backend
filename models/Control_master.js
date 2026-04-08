const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ControlMaster = sequelize.define("control_master", {
  control_master_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  control_type: { type: DataTypes.ENUM("screen","button","action", "menu"), allowNull: false },
  control_key: { type: DataTypes.STRING, unique: true },
  control_name: DataTypes.STRING,
  control_desc: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: "Active" }
}, { timestamps: false });

module.exports = ControlMaster;
