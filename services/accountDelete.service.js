const sequelize = require("../config/database");
const User = require("../models/User");
const AdminUser = require("../models/Admin_user");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");

class AccountService {
  static async deactivateOwnAccount(currentUser) {
    const t = await sequelize.transaction();

    try {
      if (!currentUser || !currentUser.user_id || !currentUser.role) {
        await t.rollback();
        return {
          success: false,
          message: "Unauthorized user context",
          data: {},
          errorCode: "UNAUTHORIZED",
        };
      }

      const role = String(currentUser.role).toLowerCase();
      const updatedBy = currentUser.user_id;

      const user = await User.findByPk(currentUser.user_id, {
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return {
          success: false,
          message: "User not found",
          data: {},
          errorCode: "USER_NOT_FOUND",
        };
      }

      if (user.status === "Inactive") {
        await t.rollback();
        return {
          success: false,
          message: "Account already inactive",
          data: {},
          errorCode: "ALREADY_INACTIVE",
        };
      }

      let profile = null;
      let refId = null;

      if (role.includes("admin")) {
        refId = currentUser.admin_id;

        profile = await AdminUser.findByPk(refId, { transaction: t });

        if (!profile) {
          await t.rollback();
          return {
            success: false,
            message: "Admin profile not found",
            data: {},
            errorCode: "PROFILE_NOT_FOUND",
          };
        }

        await profile.update(
          {
            status: "Inactive"
          },
          { transaction: t }
        );
      } else if (role === "doctor") {
        refId = currentUser.doctor_id;

        profile = await Doctor.findByPk(refId, { transaction: t });

        if (!profile) {
          await t.rollback();
          return {
            success: false,
            message: "Doctor profile not found",
            data: {},
            errorCode: "PROFILE_NOT_FOUND",
          };
        }

        await profile.update(
          {
            status: "Inactive",
            updated_by: updatedBy,
            updated_on: new Date(),
          },
          { transaction: t }
        );
      } else if (role === "patient") {
        refId = currentUser.patient_id;

        profile = await Patient.findByPk(refId, { transaction: t });

        if (!profile) {
          await t.rollback();
          return {
            success: false,
            message: "Patient profile not found",
            data: {},
            errorCode: "PROFILE_NOT_FOUND",
          };
        }

        await profile.update(
          {
            status: "Inactive"
          },
          { transaction: t }
        );
      } else {
        await t.rollback();
        return {
          success: false,
          message: "Unsupported role",
          data: {},
          errorCode: "INVALID_ROLE",
        };
      }

      await user.update(
        {
          status: "Inactive"
        },
        { transaction: t }
      );

      await t.commit();

      return {
        success: true,
        message: "Account deactivated successfully",
        data: {
          user_id: currentUser.user_id,
          role: currentUser.role,
          ref_id: refId,
          status: "Inactive",
        },
        errorCode: null,
      };
    } catch (error) {
      await t.rollback();

      return {
        success: false,
        message: error.message || "Failed to deactivate account",
        data: {},
        errorCode: "BUSINESS_ERROR",
      };
    }
  }
}

module.exports = AccountService;