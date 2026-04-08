const express = require("express");
const router = express.Router();

const doctorProfileController = require("../controllers/doctorDetails.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post( "/profile/:doctor_id", authMiddleware, doctorProfileController.saveDoctorProfile);

module.exports = router;