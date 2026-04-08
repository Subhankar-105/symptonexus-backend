const express = require("express");
const router = express.Router();

const DoctorAvailabilityController = require("../controllers/slotAvailability.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/* ADD / UPDATE SLOT */
router.post("/slot-booking", authMiddleware, DoctorAvailabilityController.upsertSlot);

module.exports = router;