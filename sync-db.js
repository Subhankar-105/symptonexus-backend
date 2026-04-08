const { sequelize } = require("./models");

sequelize.sync({ alter: true })
  .then(() => {
    console.log("DB schema updated");
    process.exit();
  })
  .catch(err => console.error(err));
