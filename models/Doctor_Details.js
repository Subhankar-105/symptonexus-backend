const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorDetail = sequelize.define("doctor_details", {
  doctor_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: DataTypes.INTEGER,
  current_address_id: DataTypes.INTEGER,
  permanent_address_id: DataTypes.INTEGER,
  experience: DataTypes.STRING,
  licence_number: DataTypes.STRING,
  registration_number: DataTypes.STRING,
  sort_desc: DataTypes.STRING,
}, {
  timestamps: false,
});

module.exports = DoctorDetail;
