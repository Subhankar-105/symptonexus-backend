const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/create", authMiddleware,  AdminController.createAdmin);

router.get("/alladmins", AdminController.getAllAdmins);

router.put("/deactivate-admin", authMiddleware, AdminController.deactivateAdmin);

module.exports = router;
