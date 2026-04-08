// routes/doctor.routes.js
const express = require("express");
const router = express.Router();

const DoctorController = require("../controllers/doctor.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE DOCTOR
router.post("/create", authMiddleware, DoctorController.createDoctor);
router.get("/pending-doctors", authMiddleware, DoctorController.getPendingDoctors);
router.put("/update-status", authMiddleware, DoctorController.updateDoctorStatus);
router.get("/doctor-list", authMiddleware, DoctorController.getDoctorList);
router.get("/public-doctor-list", DoctorController.getDoctorList);
router.put("/deactivate-doctor", authMiddleware, DoctorController.deactivateDoctor);



module.exports = router;
