const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Address = sequelize.define("addresses", {
  address_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  address_line_1: DataTypes.STRING,
  address_line_2: DataTypes.STRING,
  city: DataTypes.STRING,
  district: DataTypes.STRING,
  state: DataTypes.STRING,
  country: DataTypes.STRING,
  pin: DataTypes.STRING,

  status: {
    type: DataTypes.STRING,
    defaultValue: "Active",
  },
}, {
  timestamps: false,
});

module.exports = Address;
