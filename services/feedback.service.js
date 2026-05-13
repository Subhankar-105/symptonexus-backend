const { Feedback, User, Role } = require("../models");

const createFeedback = async (data) => {
  return await Feedback.create(data);
};

const getAllFeedback = async () => {
  return await Feedback.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_name"]
      },
      {
        model: Role,
        as: "role",
        attributes: ["role_name"]
      }
    ],
    order: [["created_at", "DESC"]],
  });
};

module.exports = {
  createFeedback,
  getAllFeedback
};