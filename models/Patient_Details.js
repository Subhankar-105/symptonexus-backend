const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatientDetails = sequelize.define("patient_details", {
  patient_details_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  current_address_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  permanent_address_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  marital_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  blood_group: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  gender: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },


  allergies: {
      type: DataTypes.JSON, // array
      allowNull: true,
    },

    smoking: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    alcohol: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
  timestamps: false,
});

module.exports = PatientDetails;
