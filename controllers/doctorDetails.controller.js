const asyncHandler = require("../utils/asyncHandler");
const doctorProfileService = require("../services/doctorProfile.service");

class DoctorProfileController {

  saveDoctorProfile = asyncHandler(async (req, res) => {

    try {

      console.log("REQUEST BODY:", req.body);

      /* ================= GET FROM PARAM ================= */

      const { doctor_id } = req.params;

      if (!doctor_id) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Doctor ID is required",
          {},
          "DOCTOR_ID_REQUIRED",
          false
        );
      }

      req.body.doctor_id = doctor_id;

      /* ================= SERVICE ================= */

      const result = await doctorProfileService.saveDoctorProfile(req.body);

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
        "Doctor profile saved successfully",
        {
          user: result.user,
          doc_profile: result.doc_profile
        },
        null,
        true
      );

    } catch (error) {

      console.error("SAVE DOCTOR PROFILE ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        error.message || "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });

}

module.exports = new DoctorProfileController();