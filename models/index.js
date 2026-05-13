const sequelize = require("../config/database");
const Feedback = require("./Feedback");

/* ================= IMPORT MODELS ================= */

const AdminUser = require("./Admin_user");
const AdminUserDetails = require('./Admin_user_Details');

const Doctor = require("./Doctor");
const DoctorDetail = require("./Doctor_Details");
const DoctorSpecialization = require("./Doctor_specalization");
const DoctorExperience = require("./Doctor_Experience");

const Patient = require("./patient");
const PatientDetails = require("./Patient_Details");

const Appointment = require("./Appointment");
const DoctorAvailability = require("./Doctor_Availablity");

const Address = require("./Address");

const DomainLookup = require("./Domain_lookup");

const User = require("./User");

const Role = require("./Role");

const ControlMaster = require("./Control_master");

const ControlRoleMapping = require("./Control_role_mapping");

const UserRoleMapping = require("./User_role_mapping");

/* =====================================================
      Appointment
===================================================== */

/* PATIENT */
Patient.hasMany(Appointment, {
  foreignKey: "patient_id",
  as: "appointments"
});

Appointment.belongsTo(Patient, {
  foreignKey: "patient_id",
  as: "patient"
});

/* DOCTOR */
Doctor.hasMany(Appointment, {
  foreignKey: "doctor_id",
  as: "appointments"
});

Appointment.belongsTo(Doctor, {
  foreignKey: "doctor_id",
  as: "doctor"
});

/* STATUS LOOKUP */
Appointment.belongsTo(DomainLookup, {
  foreignKey: "booking_status",
  targetKey: "domain_value",
  as: "statusLookup"
});

/* DOCTOR → AVAILABILITY */

Doctor.hasMany(DoctorAvailability, {
  foreignKey: "doctor_id",
  as: "availabilities"
});

DoctorAvailability.belongsTo(Doctor, {
  foreignKey: "doctor_id",
  as: "doctor"
});

/* =====================================================
   APPOINTMENT → DOCTOR AVAILABILITY (NEW)
===================================================== */

DoctorAvailability.hasMany(Appointment, {
  foreignKey: "doctor_availability_id",
  as: "appointments"
});

Appointment.belongsTo(DoctorAvailability, {
  foreignKey: "doctor_availability_id",
  as: "availability"
});

/* =====================================================
   ADMIN USER → USER
===================================================== */

AdminUser.hasOne(User, {
  foreignKey: "ref_id",
  sourceKey: "admin_user_id",
  as: "user"
});


User.belongsTo(AdminUser, {
  foreignKey: "ref_id",
  targetKey: "admin_user_id",
  as: "admin"
});

AdminUser.hasOne(AdminUserDetails, {
  foreignKey: 'admin_user_id',
  as: 'admin_detail'
});

AdminUserDetails.belongsTo(AdminUser, {
  foreignKey: 'admin_user_id',
  as: 'admin'
});

User.belongsTo(Role, {
  foreignKey: "user_type",
  targetKey: "role_id",
  as: "role"
});

Role.hasMany(User, {
  foreignKey: "user_type",
  sourceKey: "role_id",
  as: "user"
});
/* =====================================================
   USER → DOMAIN LOOKUP (USER TYPE)
===================================================== */

User.belongsTo(DomainLookup, {
  foreignKey: "user_type",
  targetKey: "domain_value",
  as: "userTypeLookup"
});

DoctorDetail.belongsTo(DomainLookup, {
  foreignKey: "gender",
  targetKey: "domain_value",
  as: "genderLookup"
});

AdminUser.belongsTo(DomainLookup, {
  foreignKey: "gender",
  targetKey: "domain_value",
  as: "genderLookup"
});

DoctorSpecialization.belongsTo(DomainLookup, {
  foreignKey: "specialization_id",
  targetKey: "domain_value",
  as: "specializationLookup"
});
/* =====================================================
   PATIENT RELATIONS
===================================================== */

Patient.hasOne(PatientDetails, {
  foreignKey: "patient_id"
});

PatientDetails.belongsTo(Patient, {
  foreignKey: "patient_id"
});


/* =====================================================
    DOCTOR RELATIONS
===================================================== */

Doctor.hasOne(DoctorDetail, {
  foreignKey: "doctor_id"
});

DoctorDetail.belongsTo(Doctor, {
  foreignKey: "doctor_id"
});


Doctor.hasMany(DoctorSpecialization, {
  foreignKey: "doctor_id",
  as: "doctor_specializations"
});

DoctorSpecialization.belongsTo(Doctor, {
  foreignKey: "doctor_id",
  as: "doctor"
});


Doctor.hasMany(DoctorExperience, {
  foreignKey: "doctor_id",
  as: "doctor_experiences" 
});

DoctorExperience.belongsTo(Doctor, {
  foreignKey: "doctor_id",
  as: "doctor"
});



/* =====================================================
    ADDRESS RELATIONS
===================================================== */

Address.hasMany(PatientDetails, {
  foreignKey: "current_address_id"
});

Address.hasMany(PatientDetails, {
  foreignKey: "permanent_address_id"
});


PatientDetails.belongsTo(Address, {
  foreignKey: "current_address_id",
  as: "CurrentAddress"
});


PatientDetails.belongsTo(Address, {
  foreignKey: "permanent_address_id",
  as: "PermanentAddress"
});

/* ================= DOCTOR ADDRESS RELATION ================= */

Address.hasMany(DoctorDetail, {
  foreignKey: "current_address_id"
});

Address.hasMany(DoctorDetail, {
  foreignKey: "permanent_address_id"
});

DoctorDetail.belongsTo(Address, {
  foreignKey: "current_address_id",
  as: "CurrentAddress"
});

DoctorDetail.belongsTo(Address, {
  foreignKey: "permanent_address_id",
  as: "PermanentAddress"
});

/* ================= Admin ADDRESS RELATION ================= */

Address.hasMany(AdminUserDetails, {
  foreignKey: "current_address_id"
});

Address.hasMany(AdminUserDetails, {
  foreignKey: "permanent_address_id"
});

AdminUserDetails.belongsTo(Address, {
  foreignKey: "current_address_id",
  as: "CurrentAddress"
});

AdminUserDetails.belongsTo(Address, {
  foreignKey: "permanent_address_id",
  as: "PermanentAddress"
});


/* =====================================================
  DOMAIN LOOKUP RELATIONS
===================================================== */

PatientDetails.belongsTo(DomainLookup, {
  foreignKey: "blood_group",
  targetKey: "domain_value",
  as: "BloodGroup"
});


PatientDetails.belongsTo(DomainLookup, {
    foreignKey: "gender",
  targetKey: "domain_value",
  as: "genderLookup"
});



/* =====================================================
   USER ROLE MAPPING RELATIONS (IMPORTANT FIX)
===================================================== */

User.belongsToMany(Role, {
  through: UserRoleMapping,
  foreignKey: "user_id",
  as: "roles"
});


Role.belongsToMany(User, {
  through: UserRoleMapping,
  foreignKey: "role_id",
  as: "users"
});


/* DIRECT ASSOCIATIONS (REQUIRED FOR LOGIN) */

UserRoleMapping.belongsTo(Role, {
  foreignKey: "role_id",
  as: "Role"
});


Role.hasMany(UserRoleMapping, {
  foreignKey: "role_id",
  as: "UserRoleMappings"
});


UserRoleMapping.belongsTo(User, {
  foreignKey: "user_id",
  as: "User"
});


User.hasMany(UserRoleMapping, {
  foreignKey: "user_id",
  as: "UserRoleMappings"
});


/* =====================================================
   CONTROL ROLE MAPPING RELATIONS
===================================================== */

Role.belongsToMany(ControlMaster, {
  through: ControlRoleMapping,
  foreignKey: "role_id",
  as: "controls"
});


ControlMaster.belongsToMany(Role, {
  through: ControlRoleMapping,
  foreignKey: "control_master_id",
  as: "roles"
});


ControlMaster.hasMany(ControlRoleMapping, {
  foreignKey: "control_master_id"
});


ControlRoleMapping.belongsTo(ControlMaster, {
  foreignKey: "control_master_id"
});


ControlRoleMapping.belongsTo(Role, {
  foreignKey: "role_id"
});

/* ================= FEEDBACK RELATIONS ================= */

User.hasMany(Feedback, {
  foreignKey: "user_id",
  as: "feedbacks"
});

Feedback.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

Role.hasMany(Feedback, {
  foreignKey: "role_id",
  as: "feedbacks"
});

Feedback.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role"
});


/* =====================================================
   EXPORT ALL MODELS
===================================================== */

module.exports = {

  sequelize,

  AdminUser,

  AdminUserDetails,

  User,

  Role,

  UserRoleMapping,

  ControlMaster,

  ControlRoleMapping,

  Doctor,

  DoctorDetail,

  DoctorSpecialization,

  DoctorExperience,

  Patient,

  PatientDetails,

  Address,

  DomainLookup,

  Appointment,

  DoctorAvailability,

  Feedback
};
