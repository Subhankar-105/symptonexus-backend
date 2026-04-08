const asyncHandler = require("../utils/asyncHandler");
const adminProfileService = require("../services/adminProfile.service");

class AdminDetailsController {

  /* ===================== SAVE ADMIN PROFILE ===================== */
  saveAdminProfile = asyncHandler(async (req, res) => {

    try {

      console.log("REQUEST BODY:", req.body);
      console.log("PARAMS:", req.params);

      const { admin_user_id } = req.params;

      /* ================= VALIDATION ================= */

      if (!admin_user_id) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Admin User ID is required",
          {},
          "ADMIN_USER_ID_REQUIRED",
          false
        );
      }

      /* ================= SERVICE ================= */

      const result = await adminProfileService.saveAdminProfile({
        ...req.body,
        admin_user_id: Number(admin_user_id), // 🔥 inject param
      });

      if (!result || typeof result !== "object") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      /* ================= SUCCESS ================= */

      return res.sendResponse(
        res.STATUS.SUCCESS,
        "Admin profile saved successfully",
        {
          user: result.user,
          profile: result.profile
        },
        null,
        true
      );

    } catch (error) {

      console.error("SAVE ADMIN PROFILE ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        error.message || "Something went wrong",
        {},
        "SERVER_ERROR"
      );

    }

  });

}

module.exports = new AdminDetailsController();