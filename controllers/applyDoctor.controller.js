const applyDoctorService = require("../services/applyDoctor.service");

/* ================= CONTROLLER ================= */

class DoctorController {

  async applyDoctor(req, res) {
    try {
      const { name, specialization, email, phone } = req.body;
      const cvFile = req.file;

      /* ================= VALIDATION ================= */

      if (!name || !specialization || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: "ALL_FIELDS_REQUIRED"
        });
      }

      if (!cvFile) {
        return res.status(400).json({
          success: false,
          message: "CV_FILE_REQUIRED"
        });
      }

      /* ================= SERVICE CALL ================= */

      const result = await applyDoctorService.sendDoctorApplicationEmail(
        { name, specialization, email, phone },
        cvFile
      );

      /* ================= RESPONSE ================= */

      return res.status(200).json({
        success: true,
        message: result.message || "Application submitted successfully"
      });

    } catch (error) {
      console.error("APPLY_DOCTOR_CONTROLLER_ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "INTERNAL_SERVER_ERROR"
      });
    }
  }
}

module.exports = new DoctorController();