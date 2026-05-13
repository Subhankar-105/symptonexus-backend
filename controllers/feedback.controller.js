const { UserRoleMapping } = require("../models");
const feedbackService = require("../services/feedback.service");

const createFeedback = async (req, res) => {
  try {
    const roleMapping = await UserRoleMapping.findOne({
      where: { user_id: 1 }
    });

    const feedback = await feedbackService.createFeedback({
      ...req.body,
      user_id: 1,
      role_id: 1
    });

    res.status(201).json(feedback);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllFeedback();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback
};