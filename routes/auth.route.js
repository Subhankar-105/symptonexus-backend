const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signupPatient);
router.post("/send-otp", AuthController.sendOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;