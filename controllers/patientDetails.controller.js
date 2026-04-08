const asyncHandler = require("../utils/asyncHandler");
const patientProfileService = require("../services/patientProfile.service");

class PatientDetailsController {

  /* ===================== SAVE PATIENT PROFILE ===================== */
  savePatientProfile = asyncHandler(async (req, res) => {

    try {

      console.log("REQUEST BODY:", req.body);

      const { patient_id } = req.body;

      /* ================= VALIDATION ================= */

      if (!patient_id) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Patient ID is required",
          {},
          "PATIENT_ID_REQUIRED",
          false
        );
      }

      /* ================= SERVICE ================= */

      const result = await patientProfileService.savePatientProfile(req.body);

      // Defensive check
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
        "Patient profile saved successfully",
        {
          user: result.user,
          profile: result.profile
        },
        null,
        true
      );

    } catch (error) {

      console.error("SAVE PROFILE ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        error.message || "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });

}

module.exports = new PatientDetailsController();
