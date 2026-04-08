const express = require("express");
const router = express.Router();

const AcknowledgementPdfController = require("../controllers/acknowledgementPdf.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/* =====================================================
   ACKNOWLEDGEMENT PDF ROUTES
===================================================== */

/* DOWNLOAD ACKNOWLEDGEMENT PDF */
router.post(
  "/acknowledgement", authMiddleware,
  AcknowledgementPdfController.generateAcknowledgementPdf
);

module.exports = router;