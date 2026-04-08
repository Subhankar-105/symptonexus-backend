const express = require("express");
const router = express.Router();

const AccountController = require("../controllers/accountDelete.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.put(
  "/deactivate",
  authMiddleware,
  AccountController.deactivateOwnAccount
);

module.exports = router;