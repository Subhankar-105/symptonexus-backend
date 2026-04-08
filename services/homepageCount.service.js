const sequelize = require("../config/database");

const User = require("../models/User");
const Role = require("../models/Role");
const Patient =require("../models/patient");
const { Doctor, DoctorSpecialization } = require("../models");
const { fn, col } = require("sequelize");

class DashboardService {
 static async getDashboardCount() {

  const t = await sequelize.transaction();

  try {

    /* ================= PATIENT COUNT ================= */

    const patientCount = await Patient.count({
      where: {
        status: "Active"
      },
      transaction: t
    });

    /* ================= DOCTOR COUNT ================= */

    const doctorCount = await Doctor.count({
      where: {
        status: "Active"
      },
      transaction: t
    });

    await t.commit();

    return {
      success: true,
      data: {
        patientCount,
        doctorCount
      }
    };

  } catch (error) {

    await t.rollback();

    console.error("DASHBOARD COUNT ERROR:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard count"
    };

  }

}
  static async getSpecializationWiseDoctorCount() {
    const t = await sequelize.transaction();

    try {
      const specializationWiseCount = await DoctorSpecialization.findAll({
        attributes: [
          "specialization_id",
          [fn("COUNT", col("doctor.doctor_id")), "doctor_count"]
        ],
        include: [
          {
            model: Doctor,
            as: "doctor",
            attributes: [],
            required: true,
            where: {
              status: "Active"
            }
          }
        ],
        group: ["specialization_id"],
        raw: true,
        transaction: t
      });

      await t.commit();

      return {
        success: true,
        data: specializationWiseCount
      };
    } catch (error) {
      await t.rollback();

      console.error("SPECIALIZATION COUNT ERROR:", error);

      return {
        success: false,
        message: "Failed to fetch specialization wise doctor count"
      };
    }
  }
}

module.exports = DashboardService;