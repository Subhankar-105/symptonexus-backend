require("dotenv").config();
const express = require('express');
const cors = require("cors");
const app = express();
const responseMiddleware = require("./middlewares/response.middleware");
const authMiddleware = require("./middlewares/auth.middleware");
const feedbackRoutes = require("./routes/feedback.routes");


const { sequelize, Patient, PatientDetails } = require("./models");

require("./models/User");
require("./models/Admin_user");
require("./models/Doctor");

sequelize.authenticate()
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Error:", err));
  
app.use(cors({
  origin: "http://localhost:3000", // frontend origin
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(responseMiddleware); 
app.use(express.urlencoded({ extended: true }));
app.use("/api/ai", require("./routes/ai.routes"));

app.use("/api/feedback", feedbackRoutes);

const registerRoutes = require('./routes/index.routes');
registerRoutes(app);

sequelize.sync()
  .then(() => {
    console.log("Database synced")
      })

const PORT = 4000;

//  IMPORTANT FIX
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Prevent socket delays on Windows
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
