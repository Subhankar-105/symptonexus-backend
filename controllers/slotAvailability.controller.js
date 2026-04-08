const DoctorAvailabilityService = require("../services/slotAvailability.service");
const asyncHandler = require("../utils/asyncHandler");

class DoctorAvailabilityController {

  /* =====================================================
     UPSERT SLOT (CREATE / UPDATE)
  ===================================================== */
  static upsertSlot = asyncHandler(async (req, res) => {
    try {

      const payload = req.body;

      // Logged-in user
      const userId = req.user?.user_id || null;

      const result = await DoctorAvailabilityService.upsertSlot(
        payload,
        userId
      );

      // Defensive check
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      // Business failure
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message,
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Slot added successfully",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("UPSERT SLOT ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

}

module.exports = DoctorAvailabilityController;