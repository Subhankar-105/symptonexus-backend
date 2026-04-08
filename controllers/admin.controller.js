const asyncHandler = require("../utils/asyncHandler");
const AdminService = require("../services/admin.service");
const Role = require("../models/Role");


class AdminController {

    /* ===================== CREATE ADMIN ===================== */
 static createAdmin = asyncHandler(async (req, res) => {

  try {

    /* CHECK ONLY SUPER ADMIN CAN CREATE ADMIN */

    if (!req.user.role || req.user.role.toLowerCase() !== "super admin") {

      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Only Super Admin can create admin",
        {},
        "UNAUTHORIZED"
      );

    }

    /* PASS SUPER ADMIN ROLE_ID AS created_by */

    const roleRecord = await Role.findOne({
      where: { role_name: req.user.role }
    });

    const createdByRoleId = roleRecord?.role_id || null;

    const result = await AdminService.createAdmin(
      req.body,
      createdByRoleId
    );

    if (!result.success) {

      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message,
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );

    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message,
      result.data,
      null,
      true
    );

  }
  catch (error) {

    console.error("CREATE ADMIN CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      {},
      "SERVER_ERROR"
    );

  }

});

  /* ===================== GET ALL ADMINS ===================== */
  static getAllAdmins = asyncHandler(async (req, res) => {

    try {

      const result = await AdminService.getAllAdmins();

      // Defensive check
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      // Business error
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to fetch admins",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Admins fetched successfully",
        result.data || [],
        null,
        true
      );

    } catch (error) {

      console.error("GET ALL ADMINS CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });

  /* ===================== DEACTIVATE ADMIN ===================== */
  
static deactivateAdmin = asyncHandler(async (req, res) => {

  try {

    /* CHECK ONLY SUPER ADMIN CAN DEACTIVATE ADMIN */
    if (!req.user.role || req.user.role.toLowerCase() !== "super admin") {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Only Super Admin can deactivate admin",
        {},
        "UNAUTHORIZED"
      );
    }

    const { admin_user_id } = req.body;

    const result = await AdminService.deactivateAdmin(admin_user_id);

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message,
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message,
      result.data,
      null,
      true
    );

  } catch (error) {

    console.error("DEACTIVATE ADMIN CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong",
      {},
      "SERVER_ERROR"
    );

  }

});

}

module.exports = AdminController;
