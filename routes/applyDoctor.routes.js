const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const applyDoctorController = require("../controllers/applyDoctor.controller");

router.post(
  "/apply-doctor",
  upload.single("cv"),
  (req, res) => applyDoctorController.applyDoctor(req, res)
);

module.exports = router;
