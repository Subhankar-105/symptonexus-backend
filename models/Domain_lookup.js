const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DomainLookup = sequelize.define("domain_lookup", {
  domain_lookup_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  domain_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  domain_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  domain_value: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  domain_details: DataTypes.STRING,
}, {
  timestamps: false,
});

module.exports = DomainLookup;
