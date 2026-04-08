const express = require("express");
const router = express.Router();

const patientDetailsController = require("../controllers/patientDetails.controller");

// ONLY POST API
router.post("/profile", patientDetailsController.savePatientProfile);

module.exports = router;
