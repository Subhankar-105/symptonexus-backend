const AppointmentService = require("../services/appointment.service");
const asyncHandler = require("../utils/asyncHandler");

class AppointmentController {

  /* =====================================================
     CREATE APPOINTMENT
  ===================================================== */
  static createAppointment = asyncHandler(async (req, res) => {
    try {

      const payload = req.body;

      const createdBy = req.user?.user_id || null;

      const result = await AppointmentService.createAppointment(payload, createdBy);

      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to create appointment",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Appointment booked successfully",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("CREATE APPOINTMENT CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  /* =====================================================
   GET ALL APPOINTMENTS
===================================================== */
static getAllAppointments = asyncHandler(async (req, res) => {
  try {
    const rawRoleId = req.user?.role_id ?? req.user?.user_type ?? null;
    const rawRoleName = req.user?.role_name ?? req.user?.role ?? null;

    let roleId = null;

    /* resolve numeric role id first */
    if (rawRoleId !== null && rawRoleId !== undefined && !isNaN(Number(rawRoleId))) {
      roleId = Number(rawRoleId);
    }

    /* if role id not found, resolve from role name */
    if (!roleId && typeof rawRoleName === "string") {
      const roleName = rawRoleName.trim().toLowerCase();

      if (roleName === "super admin") {
        roleId = 1;
      } else if (roleName === "standard admin") {
        roleId = 2;
      } else if (roleName === "guest admin") {
        roleId = 3;
      } else if (roleName === "doctor") {
        roleId = 4;
      } else if (roleName === "patient") {
        roleId = 5;
      }
    }

    let userId = null;
    let doctorId = null;
    let patientId = null;

    if (roleId === 1 || roleId === 2 ) {
      userId =
        req.user?.admin_id ??
        req.user?.admin_user_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        null;
    }

     /* guest admin -> IMPORTANT: use user_id first */
    if (roleId === 3) {
      userId =
        req.user?.user_id ??
        req.user?.admin_id ??
        req.user?.admin_user_id ??
        req.user?.ref_id ??
        null;
    }

    if (roleId === 4) {
      doctorId =
        req.user?.doctor_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.doctor_id ??
        null;

      userId = req.user?.user_id ?? doctorId;
    }

    if (roleId === 5) {
      patientId =
        req.user?.patient_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.patient_id ??
        null;

      userId = req.user?.user_id ?? patientId;
    }

    if (![1, 2, 3, 4, 5].includes(Number(roleId))) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "This role is not allowed for appointment list",
        {
          received_role_id: rawRoleId ?? null,
          received_role_name: rawRoleName ?? null
        },
        "BUSINESS_ERROR",
        false
      );
    }

    const result = await AppointmentService.getAllAppointments(
      userId,
      roleId,
      doctorId,
      patientId
    );

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message || "Failed to fetch appointments",
        result.data || [],
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointments fetched successfully",
      result.data || [],
      null,
      true
    );

  } catch (error) {
    console.error("GET ALL APPOINTMENTS CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );
  }
});

  /* =====================================================
     GET PENDING APPOINTMENTS FOR STANDARD ADMIN
  ===================================================== */
  static getPendingAppointmentsByAdmin = asyncHandler(async (req, res) => {
  try {
    const rawRoleId = req.user?.role_id ?? req.user?.user_type ?? null;
    const rawRoleName = req.user?.role_name ?? req.user?.role ?? null;

    let roleId = null;

    /* resolve numeric role id first */
    if (rawRoleId !== null && rawRoleId !== undefined && !isNaN(Number(rawRoleId))) {
      roleId = Number(rawRoleId);
    }

    /* if role id not found, resolve from role name */
    if (!roleId && typeof rawRoleName === "string") {
      const roleName = rawRoleName.trim().toLowerCase();

      if (roleName === "standard admin") {
        roleId = 2;
      } else if (roleName === "doctor") {
        roleId = 4;
      }
    }

    let adminId = null;
    let doctorId = null;

    if (roleId === 2) {
      adminId =
        req.user?.admin_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.admin_id ??
        null;
    } else if (roleId === 4) {
      doctorId =
        req.user?.doctor_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.doctor_id ??
        null;
    } else {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "This role is not allowed for appointment list",
        {
          received_role_id: rawRoleId ?? null,
          received_role_name: rawRoleName ?? null
        },
        "BUSINESS_ERROR",
        false
      );
    }

    const result = await AppointmentService.getPendingAppointmentsByAdmin(
      adminId,
      roleId,
      doctorId
    );

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message || "Failed to fetch appointments",
        result.data || [],
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointments fetched successfully",
      result.data || [],
      null,
      true
    );

  } catch (error) {
    console.error("GET PENDING APPOINTMENTS CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );
  }
});

  //Appoinment Bokking Status   

static updateAppointmentStatus = asyncHandler(async (req, res) => {
  try {

    const { appointment_id, action } = req.body;

    if (!appointment_id || !action) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "appointment_id and action are required",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    const updatedBy =
      req.user?.admin_id ||
      req.user?.user_id ||
      req.body.updated_by ||
      null;

    const result = await AppointmentService.updateAppointmentStatus(
      Number(appointment_id),
      action,
      updatedBy
    );

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message || "Failed to update appointment status",
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointment status updated successfully",
      result.data || {},
      null,
      true
    );

  } catch (error) {

    console.error("UPDATE APPOINTMENT STATUS CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );

  }
});

/* =====================================================
   CANCEL APPOINTMENT (PATIENT / DOCTOR)
===================================================== */
static cancelAppointment = asyncHandler(async (req, res) => {
  try {

    const { appointment_id } = req.body;

    if (!appointment_id) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "appointment_id is required",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    /* ================= ROLE RESOLVE ================= */
    const rawRoleId = req.user?.role_id ?? req.user?.user_type ?? null;
    const rawRoleName = req.user?.role_name ?? req.user?.role ?? null;

    let roleId = null;

    if (rawRoleId && !isNaN(Number(rawRoleId))) {
      roleId = Number(rawRoleId);
    }

    if (!roleId && typeof rawRoleName === "string") {
      const roleName = rawRoleName.trim().toLowerCase();

      if (roleName === "doctor") roleId = 4;
      else if (roleName === "patient") roleId = 5;
    }

    if (![4, 5].includes(Number(roleId))) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "Only doctor or patient can cancel appointment",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    /* ================= USER ID MAPPING ================= */
    let userId =
      req.user?.doctor_id ??
      req.user?.patient_id ??
      null;
    let patientId = null;
    let doctorId = null;

    if (roleId === 5) {
      patientId =
        req.user?.patient_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        null;
    }

    if (roleId === 4) {
      doctorId =
        req.user?.doctor_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        null;
    }

    /* ================= CALL SERVICE ================= */
    const result = await AppointmentService.cancelAppointment(
      Number(appointment_id),
      roleId,
      userId,
      patientId,
      doctorId
    );

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message || "Failed to cancel appointment",
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointment cancelled successfully",
      result.data || {},
      null,
      true
    );

  } catch (error) {

    console.error("CANCEL APPOINTMENT CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );
  }
});

/* =====================================================
   ASSIGN APPOINTMENT TIME (ADMIN)
===================================================== */
static assignAppointmentTime = asyncHandler(async (req, res) => {
  try {

    const { appointment_id, appointment_time } = req.body;

    if (!appointment_id || !appointment_time) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "appointment_id and appointment_time are required",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    /* GET ADMIN ID FROM TOKEN */
    const adminId =
      req.user?.admin_id ||
      req.user?.admin_user_id ||
      req.user?.user_id ||
      null;

    if (!adminId) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "Admin not authorized",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    /* CALL SERVICE */
    const result = await AppointmentService.assignAppointmentTime({
      appointment_id,
      appointment_time,
      admin_id: adminId
    });

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    if (!result.success) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        result.message || "Failed to assign appointment time",
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointment time assigned successfully",
      result.data || {},
      null,
      true
    );

  } catch (error) {

    console.error("ASSIGN APPOINTMENT TIME CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );

  }
});

}

module.exports = AppointmentController;