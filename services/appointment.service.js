const sequelize = require("../config/database");
const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/Doctor_Availablity");
const Admin = require("../models/Admin_user");
const Doctor = require("../models/Doctor");
const DoctorSpecialization = require("../models/Doctor_specalization");
const DoctorDetails = require("../models/Doctor_Details");
const DomainLookup = require("../models/Domain_lookup");
const patientDetails = require("../models/Patient_Details");
const Patient = require("../models/patient");
const Role = require("../models/Role");


const formatTimeTo12Hour = (time) => {
  if (!time) return null;

  const [hour, minute] = time.split(":");
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  h = h ? h : 12; // 0 => 12

  return `${h}:${minute} ${ampm}`;
}
class AppointmentService {

  /* CREATE APPOINTMENT BY PATIENT */
  static async createAppointment(payload, createdBy) {

    const t = await sequelize.transaction();

    try {

      const {
        patient_id,
        doctor_id,
        doctor_availability_id,
        booking_date
      } = payload;

      /* VALIDATION */
      if (!patient_id || !doctor_id || !doctor_availability_id || !booking_date) {

        await t.rollback();

        return {
          success: false,
          message: "patient_id, doctor_id, doctor_availability_id and booking_date are required"
        };

      }

      /* CHECK SLOT EXISTS */
      const slot = await DoctorAvailability.findOne({

        where: {
          doctor_availability_id,
          doctor_id,
          date: booking_date
        },

        transaction: t

      });

      if (!slot) {

        await t.rollback();

        return {
          success: false,
          message: "Selected doctor availability not found"
        };

      }

      /* BOOKING STATUS CHECK */
      const bookingStatusLookup = await DomainLookup.findOne({

        where: {
          domain_type: "booking_status",
          domain_name: "Booking Initiated"
        },

        transaction: t

      });

      if (!bookingStatusLookup) {

        await t.rollback();

        return {
          success: false,
          message: "Booking Initiated status not found"
        };

      }

      /* DUPLICATE CHECK */
      const existingAppointment = await Appointment.findOne({

        where: {
          patient_id,
          doctor_id,
          doctor_availability_id,
          booking_date
        },

        transaction: t

      });

      if (existingAppointment) {

        await t.rollback();

        return {
          success: false,
          message: "Appointment already booked for this date"
        };

      }

        

      /* CREATE APPOINTMENT */
      const appointment = await Appointment.create({

        patient_id,
        doctor_id,
        doctor_availability_id,
        booking_date,
        booking_time: null,
        description: null,
        document_id: null,
        booking_status: Number(bookingStatusLookup.domain_value),
        created_on: new Date(),
        created_by: patient_id,
        updated_on: null,
        updated_by: null

      }, { transaction: t });

            /* GENERATE BOOKING NUMBER */

      const date = new Date(appointment.booking_date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const booking_no = `BK-${day}${month}${year}-${String(appointment.appointment_id).padStart(4, "0")}`;

        await appointment.update({
          booking_no
        }, { transaction: t });

      await t.commit();

      return {

        success: true,
        message: "Appointment booked successfully",
        data: {
          appointment_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          doctor_availability_id: appointment.doctor_availability_id,
          booking_no: appointment.booking_no,
          booking_date: appointment.booking_no,
          booking_date: appointment.booking_date,
          booking_time: appointment.booking_time,
          description: appointment.description,
          document_id: appointment.document_id,
          booking_status: appointment.booking_status,
          created_on: appointment.created_on,
          created_by: appointment.created_by,
          updated_on: appointment.updated_on,
          updated_by: appointment.updated_by
        }

      };

    }

    catch (error) {

      await t.rollback();

      console.error("CREATE APPOINTMENT ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }

// All appointments details role based

static async getAllAppointments(userId, roleId, doctorId, patientId) {
  try {
    let whereCondition = {};
    let specializationFilter = [];
    let doctorWhereCondition = {};

    /* ================= ROLE BASED FILTER ================= */
    if (Number(roleId) === 5) {
      // patient -> only own appointments
      if (!patientId) {
        return {
          success: false,
          message: "patientId is required for patient appointment list",
          data: []
        };
      }

      whereCondition.patient_id = patientId;
    }
    else if (Number(roleId) === 4) {
      // doctor -> only own appointments
      if (!doctorId) {
        return {
          success: false,
          message: "doctorId is required for doctor appointment list",
          data: []
        };
      }

      whereCondition.doctor_id = doctorId;
    } else if (Number(roleId) === 3) {
      // guest admin -> show appointments only for doctors created by this guest admin
      if (!userId) {
        return {
          success: false,
          message: "userId is required for guest admin appointment list",
          data: []
        };
      }

      doctorWhereCondition.created_by = userId;
    }
    else if (Number(roleId) === 2) {
      // standard admin -> department wise
      const admin = await Admin.findByPk(userId);

      if (!admin || !admin.department_id) {
        return {
          success: true,
          message: "No department configured for this admin",
          data: []
        };
      }

      specializationFilter = admin.department_id
        .split(",")
        .map(id => Number(id.trim()))
        .filter(id => !isNaN(id));
    }
    else if (Number(roleId) === 1) {
      // super admin -> all appointments
    }
    else {
      return {
        success: false,
        message: "This role is not allowed for appointment list",
        data: []
      };
    }

    const appointments = await Appointment.findAll({
      where: whereCondition,
      attributes: [
        "appointment_id",
        "patient_id",
        "doctor_id",
        "doctor_availability_id",
        "booking_date",
        "booking_time",
        "description",
        "document_id",
        "booking_status",
        "appointment_no",
        "booking_no",
        "created_on",
        "created_by",
        "updated_on",
        "updated_by"
      ],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: [
            "patient_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: false,
          include: [
            {
              model: patientDetails,
              as: "patient_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: [
            "doctor_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: true,
           where: Object.keys(doctorWhereCondition).length ? doctorWhereCondition : undefined,
          include: [
            {
              model: DoctorDetails,
              as: "doctor_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            },
            {
              model: DoctorSpecialization,
              as: "doctor_specializations",
              attributes: ["specialization_id"],
              required: true,
              include: [
                {
                  model: DomainLookup,
                  as: "specializationLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "specialization" },
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: DoctorAvailability,
          as: "availability",
          required: false
        },
        {
          model: DomainLookup,
          as: "statusLookup",
          attributes: ["domain_name"],
          where: { domain_type: "booking_status" },
          required: false
        }
      ],
      order: [["appointment_id", "DESC"]]
    });

    let filteredAppointments = appointments;

    /* patient -> only own appointments already handled by whereCondition */

    /* doctor -> only own appointments + do not show booking initiated/rejected */
    if (Number(roleId) === 4) {
      filteredAppointments = appointments.filter(app =>
        Number(app.booking_status) !== 1 &&
        Number(app.booking_status) !== 3
      );
    }

    /* standard admin -> department wise + do not show booking initiated/rejected */
    if (Number(roleId) === 2) {
      filteredAppointments = appointments.filter(app => {
        const hasMatchingSpecialization =
          app.doctor?.doctor_specializations?.some(spec =>
            specializationFilter.includes(Number(spec.specialization_id))
          );

        const isAllowedStatus =
          Number(app.booking_status) !== 1 &&
          Number(app.booking_status) !== 3;

        return hasMatchingSpecialization && isAllowedStatus;
      });
    }

    /* guest admin -> only confirmed appointments */
        if (Number(roleId) === 3) {
          filteredAppointments = appointments.filter(app =>
            Number(app.booking_status) === 2
          );
        }

    const admins = await Admin.findAll({
      attributes: [
        "admin_user_id",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_no",
        "department_id"
      ]
    });

    const formatted = filteredAppointments.map((item) => {
      const specializationId = Number(
        item.doctor?.doctor_specializations?.[0]?.specialization_id
      );

      const matchedAdmins = admins.filter((admin) => {
        const deptIds = (admin.department_id || "")
          .split(",")
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id));

        return deptIds.includes(specializationId);
      });

      const primaryAdmin = matchedAdmins[0] || null;

      return {
        appointment_id: item.appointment_id,
        appointment_no: item.appointment_no || null,
        patient_id: item.patient_id,
        doctor_id: item.doctor_id,
        admin_id: primaryAdmin?.admin_user_id || null,

        doctor_name: [
          item.doctor?.first_name,
          item.doctor?.middle_name,
          item.doctor?.last_name
        ].filter(Boolean).join(" "),

        patient_name: [
          item.patient?.first_name,
          item.patient?.middle_name,
          item.patient?.last_name
        ].filter(Boolean).join(" "),

        admin_name: primaryAdmin
          ? [
              primaryAdmin.first_name,
              primaryAdmin.middle_name,
              primaryAdmin.last_name
            ].filter(Boolean).join(" ")
          : null,

        doctor_avatar: [
          item.doctor?.first_name?.[0],
          item.doctor?.last_name?.[0]
        ].filter(Boolean).join(""),

        patient_avatar: [
          item.patient?.first_name?.[0],
          item.patient?.last_name?.[0]
        ].filter(Boolean).join(""),

        doctor_phone: item.doctor?.phone_no || null,
        patient_phone: item.patient?.phone_no || null,
        admin_phone: primaryAdmin?.phone_no || null,

        doctor_email: item.doctor?.email || null,
        patient_email: item.patient?.email || null,
        admin_email: primaryAdmin?.email || null,

        doctor_gender:
          item.doctor?.doctor_detail?.genderLookup?.domain_name || null,

        patient_gender:
          item.patient?.patient_detail?.genderLookup?.domain_name || null,

        patient_dob: item.patient?.patient_detail?.dob || null,

        specialization:
          item.doctor?.doctor_specializations?.[0]?.specializationLookup?.domain_name || null,

        doctor_bio: item.doctor?.doctor_detail?.sort_desc || null,
        license_number: item.doctor?.doctor_detail?.licence_number || null,
        experience: item.doctor?.doctor_detail?.experience || null,

        appointment_date: item.booking_date,
        appointment_time: item.booking_time,
        booking_no: item.booking_no,
        booking_status: item.statusLookup?.domain_name || null,

        booking_time: item.created_on
          ? item.created_on.toISOString().split("T")[1].split(".")[0]
          : null,

        doc_slot: item.availability
          ? `${formatTimeTo12Hour(item.availability.start_time)} - ${formatTimeTo12Hour(item.availability.end_time)}`
          : null,

          start_time: formatTimeTo12Hour(item.availability.start_time),
          end_time: formatTimeTo12Hour(item.availability.end_time),

        fees: item.availability?.fees || null,

        created_on: item.created_on
          ? item.created_on.toISOString().split("T")[0]
          : null,

        created_by: item.created_by,
        updated_by: item.updated_by,
        updated_on: item.updated_on
      };
    });

    return {
      success: true,
      message: "Appointments fetched successfully",
      data: formatted
    };

  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}
/* =====================================================
   GET APPOINTMENTS Requests (ROLE ID BASED STATUS FILTER)
===================================================== */
static async getPendingAppointmentsByAdmin(adminId, roleId, doctorId = null) {
  try {
    let bookingStatusValue = null;
    let specializationFilter = [];

    /* ================= ROLE BASED STATUS ================= */
    if (Number(roleId) === 2) {
      // standard admin -> Booking Initiated
      bookingStatusValue = 1;

      const admin = await Admin.findByPk(adminId);

      if (!admin || !admin.department_id) {
        return {
          success: true,
          message: "No department configured for this admin",
          data: []
        };
      }

      specializationFilter = admin.department_id
        .split(",")
        .map(id => Number(id.trim()))
        .filter(id => !isNaN(id));
    }
    else if (Number(roleId) === 4) {
      // doctor -> Booking Confirmed
      bookingStatusValue = 2;

      if (!doctorId) {
        return {
          success: false,
          message: "doctorId is required for doctor appointment request list",
          data: []
        };
      }
    }
    else {
      return {
        success: false,
        message: "This role is not allowed for appointment request list",
        data: []
      };
    }

    const whereCondition = {
      booking_status: bookingStatusValue
    };

    /* doctor should see only own appointments */
    if (Number(roleId) === 4) {
      whereCondition.doctor_id = doctorId;
    }

    const appointments = await Appointment.findAll({
      where: whereCondition,

      attributes: [
        "appointment_id",
        "patient_id",
        "doctor_id",
        "doctor_availability_id",
        "booking_date",
        "booking_time",
        "description",
        "document_id",
        "booking_status",
        "appointment_no",
        "created_on",
        "created_by",
        "updated_on",
        "updated_by"
      ],

      include: [
        {
          model: Patient,
          as: "patient",
          attributes: [
            "patient_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: false,
          include: [
            {
              model: patientDetails,
              as: "patient_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: [
            "doctor_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: true,
          include: [
            {
              model: DoctorDetails,
              as: "doctor_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            },
            {
              model: DoctorSpecialization,
              as: "doctor_specializations",
              attributes: ["specialization_id"],
              required: true,
              include: [
                {
                  model: DomainLookup,
                  as: "specializationLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "specialization" },
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: DoctorAvailability,
          as: "availability",
          required: false
        },
        {
          model: DomainLookup,
          as: "statusLookup",
          attributes: ["domain_name"],
          where: { domain_type: "booking_status" },
          required: false
        }
      ],

      order: [["appointment_id", "DESC"]]
    });

    let filteredAppointments = appointments;

    /* standard admin can see only their department specialization */
    if (Number(roleId) === 2 && specializationFilter.length > 0) {
      filteredAppointments = appointments.filter(app =>
        app.doctor?.doctor_specializations?.some(spec =>
          specializationFilter.includes(Number(spec.specialization_id))
        )
      );
    }

    const result = filteredAppointments.map(app => ({
      appointment_id: app.appointment_id,
      appointment_no: app.appointment_no || null,
      patient_id: app.patient_id,
      doctor_id: app.doctor_id,
      doctor_availability_id: app.doctor_availability_id,

      doctor_name: [
        app.doctor?.first_name,
        app.doctor?.middle_name,
        app.doctor?.last_name
      ].filter(Boolean).join(" "),

      patient_name: [
        app.patient?.first_name,
        app.patient?.middle_name,
        app.patient?.last_name
      ].filter(Boolean).join(" "),

      doctor_email: app.doctor?.email || null,
      patient_email: app.patient?.email || null,
      doctor_phone: app.doctor?.phone_no || null,
      patient_phone: app.patient?.phone_no || null,

      doctor_gender:
        app.doctor?.doctor_detail?.genderLookup?.domain_name || null,

      patient_gender:
        app.patient?.patient_detail?.genderLookup?.domain_name || null,

        patient_dob: app.patient?.patient_detail?.dob || null,

      specialization:
        app.doctor?.doctor_specializations?.[0]?.specializationLookup?.domain_name || null,

      appointment_date: app.booking_date || null,
      appointment_time: app.booking_time || null,
      description: app.description || null,
      document_id: app.document_id || null,
      booking_time: app.created_on.toISOString().split("T")[1].split(".")[0],
      booking_status: app.statusLookup?.domain_name || null,

      doctor_slot: app.availability
        ? `${app.availability.start_time} - ${app.availability.end_time}`
        : null,

      fees: app.availability?.fees || null,

      created_on: app.created_on
        ? app.created_on.toISOString().split("T")[0]
        : null,

      updated_on: app.updated_on
        ? app.updated_on.toISOString().split("T")[0]
        : null,

      created_by: app.created_by,
      updated_by: app.updated_by
    }));

    return {
      success: true,
      message: "Appointments fetched successfully",
      data: result
    };

  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);

    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}
/* =====================================================
   APPOINTMENT APPROVAL / REJECTION (LIKE DOCTOR STATUS)
===================================================== */

static async updateAppointmentStatus(appointmentId, action, updatedBy) {

  const t = await sequelize.transaction();

  try {

    /* VALIDATION */
    if (!appointmentId || !action) {
      await t.rollback();
      return {
        success: false,
        message: "appointmentId and action are required"
      };
    }

    const appointment = await Appointment.findByPk(appointmentId, { transaction: t });

    if (!appointment) {
      await t.rollback();
      return {
        success: false,
        message: "Appointment not found"
      };
    }

    /* GET DOMAIN STATUS */
    const confirmedStatus = await DomainLookup.findOne({
      where: {
        domain_type: "booking_status",
        domain_name: "Booking Confirmed"
      },
      transaction: t
    });

    const rejectedStatus = await DomainLookup.findOne({
      where: {
        domain_type: "booking_status",
        domain_name: "Booking Rejected"
      },
      transaction: t
    });

    if (!confirmedStatus || !rejectedStatus) {
      await t.rollback();
      return {
        success: false,
        message: "Booking status not configured properly"
      };
    }

    let bookingStatus = null;
    let appointmentNo = appointment.appointment_no;

    /* ================= APPROVE ================= */
    if (action.toLowerCase() === "approve") {

      bookingStatus = Number(confirmedStatus.domain_value);

      /* GENERATE BOOKING NUMBER ONLY IF NOT EXISTS */
      if (!appointmentNo) {

        const date = new Date(appointment.booking_date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        appointmentNo = `APT-${day}${month}${year}-${String(
          appointment.appointment_id
        ).padStart(4, "0")}`;
      }

    }

    /* ================= REJECT ================= */
    else if (action.toLowerCase() === "reject") {

      bookingStatus = Number(rejectedStatus.domain_value);

    }

    else {
      await t.rollback();
      return {
        success: false,
        message: "Invalid action (approve/reject)"
      };
    }

    /* UPDATE APPOINTMENT */
    await appointment.update({

      booking_status: bookingStatus,
      appointment_no: appointmentNo,
      updated_by: updatedBy,  
      updated_on: new Date()

    }, { transaction: t });


    await t.commit();

    return {
      success: true,
      message:
        action.toLowerCase() === "approve"
          ? "Appointment approved successfully"
          : "Appointment rejected successfully",

      data: {
        appointment_id: appointment.appointment_id,
        appointment_no: appointmentNo || null,
        booking_status: appointment.booking_status,
        updated_by: appointment.updated_by,
        updated_on: appointment.updated_on
      }
    };

  }

  catch (error) {

    await t.rollback();

    console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

    return {
      success: false,
      message: error.message
    };

  }

}

//cancel by patient and doctor

static async cancelAppointment(appointmentId, roleId, userId, patientId = null, doctorId = null) {

  const t = await sequelize.transaction();

  try {

    if (!appointmentId || !roleId) {
      await t.rollback();
      return {
        success: false,
        message: "appointmentId and roleId are required"
      };
    }

    /* ROLE BASE VALIDATION */
    if (Number(roleId) === 5 && !patientId) {
      await t.rollback();
      return {
        success: false,
        message: "patientId is required for patient cancel"
      };
    }

    if (Number(roleId) === 4 && !doctorId) {
      await t.rollback();
      return {
        success: false,
        message: "doctorId is required for doctor cancel"
      };
    }

    const appointment = await Appointment.findByPk(appointmentId, { transaction: t });

    if (!appointment) {
      await t.rollback();
      return {
        success: false,
        message: "Appointment not found"
      };
    }

    let statusName = "";

    /* ================= ROLE BASED CHECK ================= */

    if (Number(roleId) === 5) {
      // PATIENT
      if (appointment.patient_id !== Number(patientId)) {
        await t.rollback();
        return {
          success: false,
          message: "Patient not authorized to cancel this appointment"
        };
      }

      statusName = "Canceled by Patient";
    }

    else if (Number(roleId) === 4) {
      // DOCTOR
      if (appointment.doctor_id !== Number(doctorId)) {
        await t.rollback();
        return {
          success: false,
          message: "Doctor not authorized to cancel this appointment"
        };
      }

      statusName = "Canceled by Doctor";
    }

    else {
      await t.rollback();
      return {
        success: false,
        message: "Only patient or doctor can cancel appointment"
      };
    }

    /* FETCH DOMAIN VALUE */
    const cancelStatus = await DomainLookup.findOne({
      where: {
        domain_type: "booking_status",
        domain_name: statusName
      },
      transaction: t
    });

    if (!cancelStatus) {
      await t.rollback();
      return {
        success: false,
        message: `${statusName} not configured in domain lookup`
      };
    }

    /* OPTIONAL: prevent double cancel */
    if ([7, 8].includes(Number(appointment.booking_status))) {
      await t.rollback();
      return {
        success: false,
        message: "Appointment already cancelled"
      };
    }

    /* UPDATE */
    await appointment.update({
      booking_status: Number(cancelStatus.domain_value),
      updated_by: userId,
      updated_on: new Date()
    }, { transaction: t });

    await t.commit();

    return {
      success: true,
      message: `Appointment ${statusName}`,
      data: {
        appointment_id: appointment.appointment_id,
        booking_status: appointment.booking_status,
        updated_by: userId,
        updated_on: new Date()
      }
    };

  } catch (error) {

    await t.rollback();

    console.error("CANCEL ERROR:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

/* =====================================================
   ASSIGN APPOINTMENT TIME BY ADMIN
===================================================== */
static async assignAppointmentTime(payload) {
  const t = await sequelize.transaction();

  try {
    const { appointment_id, appointment_time, admin_id } = payload;

    /* VALIDATION */
    if (!appointment_id || !appointment_time || !admin_id) {
      await t.rollback();
      return {
        success: false,
        message: "appointment_id, appointment_time and admin_id are required"
      };
    }

    /* CHECK APPOINTMENT EXISTS */
    const appointment = await Appointment.findByPk(appointment_id, {
      transaction: t
    });

    if (!appointment) {
      await t.rollback();
      return {
        success: false,
        message: "Appointment not found"
      };
    }

    /* OPTIONAL: CHECK ADMIN EXISTS */
    const admin = await Admin.findByPk(admin_id, {
      transaction: t
    });

    if (!admin) {
      await t.rollback();
      return {
        success: false,
        message: "Admin not found"
      };
    }

    /* GET SLOT ASSIGNED STATUS FROM DOMAIN LOOKUP */
    const slotAssignedStatus = await DomainLookup.findOne({
      where: {
        domain_type: "booking_status",
        domain_name: "Slot Assigned"
      },
      transaction: t
    });

    if (!slotAssignedStatus) {
      await t.rollback();
      return {
        success: false,
        message: "Slot Assigned status not found in domain lookup"
      };
    }

    /* UPDATE APPOINTMENT */
    await appointment.update(
      {
        booking_time: appointment_time,
        booking_status: Number(slotAssignedStatus.domain_value),
        updated_by: admin_id,
        updated_on: new Date()
      },
      { transaction: t }
    );

    await t.commit();

    return {
      success: true,
      message: "Appointment time assigned successfully",
      data: {
        appointment_id: appointment.appointment_id,
        booking_date: appointment.booking_date,
        booking_time: appointment.booking_time,
        booking_status: appointment.booking_status,
        booking_status_name: slotAssignedStatus.domain_name,
        updated_by: appointment.updated_by,
        updated_on: appointment.updated_on
      }
    };
  } catch (error) {
    await t.rollback();

    console.error("ASSIGN APPOINTMENT TIME ERROR:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

}

module.exports = AppointmentService;