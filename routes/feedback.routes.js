const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");

// Submit feedback
router.post("/", feedbackController.createFeedback);

// Admin view
router.get("/", feedbackController.getAllFeedback);

module.exports = router;