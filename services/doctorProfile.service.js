const Doctor = require("../models/Doctor");
const DoctorDetails = require("../models/Doctor_Details");
const DoctorExperience = require("../models/Doctor_Experience");
const Address = require("../models/Address");
const sequelize = require("../config/database");

/* ================= ADDRESS BUILDER ================= */

const buildAddress = (addr) => {
  if (!addr) return null;

  return {
    address_line_1: addr.address_line_1 || null,
    address_line_2: addr.address_line_2 || null,
    city: addr.city || null,
    district: addr.district || null,
    state: addr.state || null,
    country: addr.country || null,
    pin: addr.pin || null,
    status: "Active",
  };
};

/* ================= SERVICE ================= */

class DoctorProfileService {
  async saveDoctorProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        doctor_id,
        dob,
        licence_number,
        registration_number,
        experience,
        bio,
        current_address,
        permanent_address,
        experiences,
      } = payload;

      if (!doctor_id) {
        throw new Error("DOCTOR_ID_REQUIRED");
      }

      /* ================= CHECK EXISTING ================= */

      const existingDetails = await DoctorDetails.findOne({
        where: { doctor_id },
        transaction: t,
      });

      /* ================= ADDRESS ================= */

      let currentAddressId = existingDetails?.current_address_id ?? null;
      let permanentAddressId = existingDetails?.permanent_address_id ?? null;

      if (current_address) {
        let existingAddress = null;

        if (currentAddressId) {
          existingAddress = await Address.findOne({
            where: { address_id: currentAddressId },
            transaction: t,
          });
        }

        const data = {
          address_line_1:
            current_address.address_line_1 ||
            existingAddress?.address_line_1 ||
            null,

          address_line_2:
            current_address.address_line_2 ||
            existingAddress?.address_line_2 ||
            null,

          city:
            current_address.city ||
            existingAddress?.city ||
            null,

          district:
            current_address.district ||
            existingAddress?.district ||
            null,

          state:
            current_address.state ||
            existingAddress?.state ||
            null,

          country:
            current_address.country ||
            existingAddress?.country ||
            null,

          pin:
            current_address.pin ||
            existingAddress?.pin ||
            null,

          status: "Active",
        };

        if (currentAddressId) {
          await Address.update(data, {
            where: { address_id: currentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(data, { transaction: t });
          currentAddressId = addr.address_id;
        }
      }

      if (permanent_address) {
        let existingAddress = null;

        if (permanentAddressId) {
          existingAddress = await Address.findOne({
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        }

        const data = {
          address_line_1:
            permanent_address.address_line_1 ||
            existingAddress?.address_line_1 ||
            null,

          address_line_2:
            permanent_address.address_line_2 ||
            existingAddress?.address_line_2 ||
            null,

          city:
            permanent_address.city ||
            existingAddress?.city ||
            null,

          district:
            permanent_address.district ||
            existingAddress?.district ||
            null,

          state:
            permanent_address.state ||
            existingAddress?.state ||
            null,

          country:
            permanent_address.country ||
            existingAddress?.country ||
            null,

          pin:
            permanent_address.pin ||
            existingAddress?.pin ||
            null,

          status: "Active",
        };

        if (permanentAddressId) {
          await Address.update(data, {
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(data, { transaction: t });
          permanentAddressId = addr.address_id;
        }
      }

      /* ================= DOB HANDLING ================= */

      const hasValidDob = !!(dob && dob !== "" && dob !== "Invalid date");

      /* ================= SAVE DOCTOR DETAILS ================= */

      const detailsData = {
        doctor_id,
        experience,
        licence_number,
        registration_number,
        sort_desc: bio,
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (hasValidDob) {
        detailsData.dob = dob;
      }

      if (existingDetails) {
        await DoctorDetails.update(detailsData, {
          where: { doctor_id },
          transaction: t,
        });
      } else {
        await DoctorDetails.create(
          {
            doctor_id,
            dob: hasValidDob ? dob : null,
            experience,
            licence_number,
            registration_number,
            sort_desc: bio,
            current_address_id: currentAddressId,
            permanent_address_id: permanentAddressId,
          },
          { transaction: t }
        );
      }

      /* ================= EXPERIENCE ================= */

      if (experiences && experiences.length > 0) {
        const existingExperiences = await DoctorExperience.findAll({
          where: { doctor_id },
          order: [["doctor_experience_id", "ASC"]],
          transaction: t,
        });

        const expData = experiences.map((exp, index) => {
          const oldExp = existingExperiences[index];

          return {
            doctor_id,
            start_date: exp.start_date || oldExp?.start_date || null,
            end_date: exp.end_date || oldExp?.end_date || null,
            organization_name:
              exp.organization_name || oldExp?.organization_name || null,
            key_experience: exp.designation || oldExp?.key_experience || null,
            experience_desc:
              exp.responsibilities || oldExp?.experience_desc || null,
          };
        });

        await DoctorExperience.destroy({
          where: { doctor_id },
          transaction: t,
        });

        await DoctorExperience.bulkCreate(expData, { transaction: t });
      }

      /* ================= RESPONSE ================= */

      const user = await Doctor.findOne({
        where: { doctor_id },
        transaction: t,
      });

      const details = await DoctorDetails.findOne({
        where: { doctor_id },
        transaction: t,
      });

      await t.commit();

      return {
        success: true,
        user: user?.toJSON() || null,
        doc_profile: details?.toJSON() || null,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new DoctorProfileService();