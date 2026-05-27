const asyncHandler = require("../utils/asyncHandler");
const ChatEngine = require("../ai-engine/chat.engine");

class AiController {

  static chat = asyncHandler(async (req, res) => {

    const { message } = req.body;

    if (!message) {
      return res.sendResponse(
        res.STATUS.BAD_REQUEST,
        "Message is required",
        {},
        "VALIDATION_ERROR"
      );
    }

    const result = await ChatEngine.handle(message);

    return res.sendResponse(
      res.STATUS.SUCCESS,
      "Response generated",
      result,
      null,
      true
    );

  });

}

module.exports = AiController;