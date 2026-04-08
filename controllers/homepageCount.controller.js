const DashboardService = require("../services/homepageCount.service");

class DashboardController {

/* =====================================================
   GET DASHBOARD COUNT
===================================================== */

static async getDashboardCount(req, res) {

  try {

    const result = await DashboardService.getDashboardCount();

    if (!result.success) {

      return res.status(400).json(result);

    }

    return res.status(200).json(result);

  }

  catch (error) {

    console.error("CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

}


/* =====================================================
   GET SPECIALIZATION WISE DOCTOR COUNT
===================================================== */

static async getSpecializationWiseDoctorCount(req, res) {

  try {

    const result = await DashboardService.getSpecializationWiseDoctorCount();

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("SPECIALIZATION COUNT CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

}

}

module.exports = DashboardController;