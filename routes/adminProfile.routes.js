const express = require("express");
const router = express.Router();

const adminProfileController = require("../controllers/adminProfile.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
    "/profile/:admin_user_id", authMiddleware, adminProfileController.saveAdminProfile);

module.exports = router;