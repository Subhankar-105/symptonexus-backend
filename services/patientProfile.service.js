const Patient = require("../models/patient");
const PatientDetails = require("../models/Patient_Details");
const Address = require("../models/Address");
const DomainLookup = require("../models/Domain_lookup");
const sequelize = require("../config/database");

/* ================= NUMBER HELPER ================= */

const toNumber = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/* ================= ADDRESS BUILDER ================= */

const buildAddress = (addr) => {
  if (!addr) return null;

  const lines =
    typeof addr.address_line === "string"
      ? addr.address_line.split(",").map(s => s.trim())
      : [];

  return {
    address_line_1: lines[0] || null,
    address_line_2: lines[1] || null,
    city: addr.city || null,
    district: addr.district || null,
    state: addr.state || null,
    country: addr.country || null,
    pin: addr.pincode || null,
    status: "Active",
  };
};

/* ================= SERVICE ================= */

class PatientProfileService {
  async savePatientProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        patient_id,
        current_address,
        permanent_address,
        dob,
        marital_status,
        occupation,
        blood_group, // NUMBER like 4
        height,
        weight,
        allergies,
        smoking,
        alcohol,
      } = payload;

      if (!patient_id) {
        throw new Error("PATIENT_ID_REQUIRED");
      }

      const existingDetails = await PatientDetails.findOne({
        where: { patient_id },
        transaction: t,
      });

      /* ================= BLOOD GROUP ================= */

      let bloodGroupValue = null;

      if (blood_group !== null && blood_group !== undefined) {
        const value = toNumber(blood_group);

        if (value === null) {
          throw new Error(`INVALID_BLOOD_GROUP: ${blood_group}`);
        }

        const bg = await DomainLookup.findOne({
          where: {
            domain_type: "blood_group",
            domain_value: value,
          },
          transaction: t,
        });

        if (!bg) {
          throw new Error(`INVALID_BLOOD_GROUP: ${value}`);
        }

        bloodGroupValue = value;
      }

      /* ================= ADDRESS ================= */

      let currentAddressId = existingDetails?.current_address_id ?? null;
      let permanentAddressId = existingDetails?.permanent_address_id ?? null;

      if (current_address) {
        const data = buildAddress(current_address);
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
        const data = buildAddress(permanent_address);
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

      /* ================= SAVE DETAILS ================= */

      const data = {
        dob,
        marital_status,
        occupation,
        height,
        weight,
        allergies,
        smoking,
        alcohol,
        blood_group: bloodGroupValue,
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (existingDetails) {
        await PatientDetails.update(data, {
          where: { patient_id },
          transaction: t,
        });
      } else {
        await PatientDetails.create(
          { patient_id, ...data },
          { transaction: t }
        );
      }

      const user = await Patient.findOne({
        where: { patient_id },
        transaction: t,
      });

      const details = await PatientDetails.findOne({
        where: { patient_id },
        transaction: t,
      });

      await t.commit();

      return {
        success: true,
        user: user.toJSON(),
        profile: details.toJSON(),
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new PatientProfileService();
