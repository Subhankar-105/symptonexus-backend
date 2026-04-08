const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoctorSpecialization = sequelize.define("doctor_specializations", {
  doctor_specialization_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  specialization_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  long_desc: DataTypes.TEXT,

  status: {
    type: DataTypes.STRING,
    defaultValue: "Active",
  },
}, {
  timestamps: false,
});

module.exports = DoctorSpecialization;
