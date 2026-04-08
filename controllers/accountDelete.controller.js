const AccountService = require("../services/accountDelete.service");

class AccountController {
  static async deactivateOwnAccount(req, res) {
    try {
      const result = await AccountService.deactivateOwnAccount(req.user);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("DEACTIVATE ACCOUNT CONTROLLER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        data: {},
        errorCode: "SERVER_ERROR",
      });
    }
  }
}

module.exports = AccountController;