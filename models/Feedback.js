const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Feedback = sequelize.define("feedback", {
  feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  feature_used: {
    type: DataTypes.STRING,
  },

  rating: {
    type: DataTypes.INTEGER,
  },

  experience: {
    type: DataTypes.TEXT,
  },

  what_went_well: {
    type: DataTypes.TEXT,
  },

  improvement: {
    type: DataTypes.TEXT,
  },

  recommendation: {
    type: DataTypes.BOOLEAN,
  },

  appointment_id: {
    type: DataTypes.INTEGER,
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }

}, {
  timestamps: false,
});

module.exports = Feedback;