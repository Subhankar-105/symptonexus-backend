const AdminUser = require("../models/Admin_user");
const AdminUserDetails = require("../models/Admin_user_Details");
const Address = require("../models/Address");
const User = require("../models/User");
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

/* ================= STATUS NORMALIZER ================= */

const normalizeStatus = (status) => {
  if (!status) return null;

  const value = String(status).trim().toLowerCase();

  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";

  return null;
};

/* ================= SERVICE ================= */

class AdminProfileService {
  async saveAdminProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        admin_user_id,
        dob,
        status,
        current_address,
        permanent_address,
      } = payload;

      if (!admin_user_id) {
        throw new Error("ADMIN_USER_ID_REQUIRED");
      }

      /* ================= CHECK ADMIN EXISTS ================= */

      const adminUser = await AdminUser.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      if (!adminUser) {
        throw new Error("ADMIN_NOT_FOUND");
      }

      /* ================= EXISTING DETAILS ================= */

      const existingDetails = await AdminUserDetails.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      let currentAddressId = existingDetails?.current_address_id ?? null;
      let permanentAddressId = existingDetails?.permanent_address_id ?? null;

      /* ================= CURRENT ADDRESS ================= */

      if (current_address) {
        let existingAddress = null;

        if (currentAddressId) {
          existingAddress = await Address.findOne({
            where: { address_id: currentAddressId },
            transaction: t,
          });
        }

        const currentAddressData = {
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
          await Address.update(currentAddressData, {
            where: { address_id: currentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(currentAddressData, {
            transaction: t,
          });
          currentAddressId = addr.address_id;
        }
      }

      /* ================= PERMANENT ADDRESS ================= */

      if (permanent_address) {
        let existingAddress = null;

        if (permanentAddressId) {
          existingAddress = await Address.findOne({
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        }

        const permanentAddressData = {
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
          await Address.update(permanentAddressData, {
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(permanentAddressData, {
            transaction: t,
          });
          permanentAddressId = addr.address_id;
        }
      }

      /* ================= DOB HANDLING ================= */

      const hasValidDob = !!(dob && dob !== "" && dob !== "Invalid date");

      /* ================= STATUS HANDLING ================= */
      // Accepts: Active / Inactive / active / inactive

      const normalizedStatus = normalizeStatus(status);

      if (status && !normalizedStatus) {
        throw new Error("INVALID_STATUS");
      }

      /* ================= SAVE ADMIN STATUS ================= */

      if (normalizedStatus) {
        await AdminUser.update(
          { status: normalizedStatus },
          {
            where: { admin_user_id },
            transaction: t,
          }
        );

        await User.update(
          { status: normalizedStatus },
          {
            where: { ref_id: admin_user_id },
            transaction: t,
          }
        );
      }

      /* ================= SAVE DETAILS ================= */

      const detailsData = {
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (hasValidDob) {
        detailsData.dob = dob;
      }

      if (existingDetails) {
        await AdminUserDetails.update(detailsData, {
          where: { admin_user_id },
          transaction: t,
        });
      } else {
        await AdminUserDetails.create(
          {
            admin_user_id,
            dob: hasValidDob ? dob : null,
            current_address_id: currentAddressId,
            permanent_address_id: permanentAddressId,
          },
          { transaction: t }
        );
      }

      /* ================= FETCH FINAL ================= */

      const user = await AdminUser.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      const details = await AdminUserDetails.findOne({
        where: { admin_user_id },
        include: [
          {
            model: Address,
            as: "CurrentAddress",
          },
          {
            model: Address,
            as: "PermanentAddress",
          },
        ],
        transaction: t,
      });

      await t.commit();

      return {
        success: true,
        message: "Admin profile updated successfully",
        user: user?.toJSON() || null,
        profile: details?.toJSON() || null,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new AdminProfileService();