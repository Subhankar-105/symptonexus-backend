const sequelize = require("../config/database");
const DoctorAvailability = require("../models/Doctor_Availablity");

class DoctorAvailabilityService {

  static async upsertSlot(payload, userId) {

    const t = await sequelize.transaction();

    try {

      const { doctor_id, date, start_time, end_time, slot_count, fees } = payload;

      if (!doctor_id || !date || !start_time || !end_time || !slot_count || !fees) {
        await t.rollback();
        return {
          success: false,
          message: "All fields are required"
        };
      }

      /* CHECK EXISTING */

      const existing = await DoctorAvailability.findOne({
        where: { doctor_id, date },
        transaction: t
      });

      /* UPDATE */

      if (existing) {

        await existing.update({
          slot_count,
          fees,
          start_time,
          end_time,
          updated_by: userId,
          updated_on: new Date()
        }, { transaction: t });

      }

      /* CREATE */

      else {

        await DoctorAvailability.create({
          doctor_id,
          date,
          start_time,
          end_time,
          slot_count,
          fees,
          status: 1,
          created_by: userId,
          created_on: new Date()
        }, { transaction: t });

      }

      await t.commit();

      // fetch full record after create/update
      const finalData = await DoctorAvailability.findOne({
        where: { doctor_id, date }
      });

      return {
        success: true,
        message: existing
          ? "Slot updated successfully"
          : "Slot added successfully",
        data: finalData
      };

    } catch (error) {

      await t.rollback();

      console.error("UPSERT SLOT ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }

}

module.exports = DoctorAvailabilityService;