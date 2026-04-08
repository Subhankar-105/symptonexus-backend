require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      connectTimeout: 60000,
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 5000,
      evict: 1000,
    },
  }
);

module.exports = sequelize;