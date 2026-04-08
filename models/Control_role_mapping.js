const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ControlRoleMapping = sequelize.define("control_role_mapping", {
  control_role_mapping_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
}, { timestamps: false });

module.exports = ControlRoleMapping;
