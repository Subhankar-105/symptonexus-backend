const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

const User = require("../models/User");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");

const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");
const Address = require("../models/Address");
const DoctorAvailability = require("../models/Doctor_Availablity");
const DoctorSpecialization = require("../models/Doctor_specalization");
const DoctorDetails = require("../models/Doctor_Details");
const DoctorExperience = require("../models/Doctor_Experience");
const PatientDetails = require("../models/Patient_Details");
const Admin_user_Details = require("../models/Admin_user_Details");


const DomainLookup = require("../models/Domain_lookup");

const ControlMaster = require("../models/Control_master");
const ControlRoleMapping = require("../models/Control_role_mapping");


class AuthService {


/* =====================================================
   LOGIN
===================================================== */

static async login(email, password, roleFromUI) {

  const t = await sequelize.transaction();

  try {

    const normalizedRole = roleFromUI?.toLowerCase();

    if (!normalizedRole) {

      await t.rollback();

      return {
        success: false,
        message: "Role is required"
      };

    }


    /* ================= FIND USER ================= */

    const user = await User.findOne({

      where: { user_name: email },
      transaction: t

    });


    if (!user) {

      await t.rollback();

      return {
        success: false,
        message: "User ID is not valid"
      };

    }

if (user.status !== "Active") {
  await t.rollback();
  return {
    success: false,
    message: `Your account is ${String(user.status).toLowerCase()}. Login is not allowed.`
  };
}


    /* ================= PASSWORD CHECK ================= */

    const match = await bcrypt.compare(password, user.password);

    if (!match) {

      await t.rollback();

      return {
        success: false,
        message: "Password not match"
      };

    }



    /* ================= GET ROLE ================= */

    const roleMapping = await UserRoleMapping.findOne({

      where: {
        user_id: user.user_id,
        status: 1
      },

      include: [{
    model: Role,
    as: "Role",   // REQUIRED FIX
    attributes: ["role_id", "role_name"]
  }],
      transaction: t

    });


    if (!roleMapping) {

      await t.rollback();

      return {
        success: false,
        message: "Role not assigned"
      };

    }


    const role_id = roleMapping.role_id;
    const role = roleMapping.Role.role_name.toLowerCase();



    /* ================= ROLE VALIDATION ================= */

    if (normalizedRole === "admin") {

      if (!["super admin", "standard admin", "guest admin"].includes(role)) {

        await t.rollback();

        return {
          success: false,
          message: "This account is not registered as admin"
        };

      }

    }

    else {

      if (normalizedRole !== role) {

        await t.rollback();

        return {
          success: false,
          message: `This account is not registered as ${normalizedRole}`
        };

      }

    }



    /* ================= LOAD PROFILE ================= */

    let profile = null;

    if (role === "patient") {

      profile = await Patient.findOne({

        where: { patient_id: user.ref_id },
        transaction: t

      });

    }

    else if (role === "doctor") {

      profile = await Doctor.findOne({

        where: { doctor_id: user.ref_id },
        transaction: t

      });

    }

    else {

      profile = await Admin.findOne({

        where: { admin_user_id: user.ref_id },
        where: { admin_user_id: user.ref_id },
  include: [
        {
          model: DomainLookup,
          as: "genderLookup",
          attributes: ["domain_name"],
          where: { domain_type: "gender" },
          required: false
        }
      ],
        transaction: t

      });

    }


    if (!profile) {

      await t.rollback();

      return {
        success: false,
        message: "Profile not found"
      };

    }

if (profile.status !== "Active") {
  await t.rollback();
  return {
    success: false,
    message: `Your account is ${String(profile.status).toLowerCase()}. Login is not allowed.`
  };
}


    /* ================= PATIENT DETAILS ================= */

    let details = null;
    let specialization = null;
    let doctorExperiences = [];
    let doctorAvailabilities = [];
        

    if (role === "patient") {

      details = await PatientDetails.findOne({

        where: { patient_id: profile.patient_id },

         include: [
        {
          model: DomainLookup,
          as: "genderLookup",
          attributes: ["domain_name"],
          where: { domain_type: "gender" },
          required: false
        },

          {
          model: DomainLookup,
          as: "BloodGroup",
          attributes: ["domain_name"],
          where: { domain_type: "blood_group" },
          required: false
        },
        
    {
      model: Address,
      as: "CurrentAddress",
      attributes: [
        "address_line_1",
        "address_line_2",
        "city",
        "district",
        "state",
        "country",
        "pin"
      ]
    },

    {
      model: Address,
      as: "PermanentAddress",
      attributes: [
        "address_line_1",
        "address_line_2",
        "city",
        "district",
        "state",
        "country",
        "pin"
      ]
    }
      ],

        transaction: t

      });

    }
if (role === "doctor") {

  details = await DoctorDetails.findOne({

    where: { doctor_id: profile.doctor_id },

     include: [
        {
          model: DomainLookup,
          as: "genderLookup",
          attributes: ["domain_name"],
          where: { domain_type: "gender" },
          required: false
        },

      /* ADDRESS */
      {
        model: Address,
        as: "CurrentAddress",
        attributes: [
          "address_line_1",
          "address_line_2",
          "city",
          "district",
          "state",
          "country",
          "pin"
        ]
      },

      {
        model: Address,
        as: "PermanentAddress",
        attributes: [
          "address_line_1",
          "address_line_2",
          "city",
          "district",
          "state",
          "country",
          "pin"
        ]
      }

    ],

    transaction: t

  });
   /* EXPERIENCE */
    doctorExperiences = await DoctorExperience.findAll({
    where: { doctor_id: profile.doctor_id },
    attributes: [
      "organization_name",
      "key_experience",
      "start_date",
      "end_date",
      "experience_desc"
    ],
    transaction: t
  });

  /* SPECIALIZATION */
  specialization = await DoctorSpecialization.findOne({
    where: { doctor_id: profile.doctor_id },
    include: [
      {
          model: DomainLookup,
          as: "specializationLookup",
          attributes: ["domain_name"],
          where: { domain_type: "specialization" },
          required: false
        },
    ],
    transaction: t
  });

  /* AVAILABILITY */
  doctorAvailabilities = await DoctorAvailability.findAll({
    where: { doctor_id: profile.doctor_id },
    attributes: ["date", "slot_count", "fees"],
    transaction: t
  });

}


if (role.includes("admin")) {

  details = await Admin_user_Details.findOne({

    where: { admin_user_id: profile.admin_user_id },

    include: [

      {
        model: Address,
        as: "CurrentAddress",
        attributes: [
          "address_line_1",
          "address_line_2",
          "city",
          "district",
          "state",
          "country",
          "pin"
        ]
      },

      {
        model: Address,
        as: "PermanentAddress",
        attributes: [
          "address_line_1",
          "address_line_2",
          "city",
          "district",
          "state",
          "country",
          "pin"
        ]
      }

    ],

    transaction: t

  });

}
    /* ================= LOAD MENUS ================= */

    const menus = await ControlMaster.findAll({

      include: [{
        model: ControlRoleMapping,
        where: { role_id: role_id },
        attributes: []
      }],

      where: {
        control_type: "menu",
        status: "Active"
      },

      order: [["control_master_id", "ASC"]],

      transaction: t

    });

/* ================= LOAD BUTTONS ================= */

const buttons = await ControlMaster.findAll({

  include: [{
    model: ControlRoleMapping,
    where: { role_id: role_id },
    attributes: []
  }],

  where: {
    control_type: "button",
    status: "Active"
  },

  order: [["control_master_id", "ASC"]],

  transaction: t

});

    /* ================= BUILD USER DATA ================= */

    let userData = {

      email: profile.email,
      role

    };


    if (role === "patient") {

      userData = {

        ...userData,

        patient_id: profile.patient_id,
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        phone_no: profile.phone_no,
        gender: details?.genderLookup?.domain_name || "",
        status: profile.status,
        created_on: profile.created_on
              ? profile.created_on.toISOString().split("T")[0]
              : null,
        created_by: profile.created_by
      };

    }


    if (role === "doctor") {

      userData = {

        ...userData,

        doctor_id: profile.doctor_id,
        doctor_no: profile.doctor_no,
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        phone_no: profile.phone_no,
        email: profile.email,
        gender: details?.genderLookup?.domain_name || "",
        specialization: specialization?.specializationLookup?.domain_name || "",
        status: profile.status,
        created_on: profile.created_on
  ? profile.created_on.toISOString().split("T")[0]
  : null,
        added_by: profile.created_by

      };

    }


    if (role.includes("admin")) {

      userData = {

        ...userData,

        admin_id: profile.admin_user_id,
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        phone_no: profile.phone_no,
        email: profile.email,
        dob: details?.dob || null,
        gender: profile.genderLookup?.domain_name || "",
        department: profile.department_id || null,
        status: profile.status,
        created_on: profile.created_on
  ? profile.created_on.toISOString().split("T")[0]
  : null,
        added_by: profile.created_by
      };

    }



    /* ================= TOKEN ================= */

    const tokenPayload = {

      user_id: user.user_id,
      role_id: role.role_id, 
      role

    };


    if (role === "patient")
      tokenPayload.patient_id = profile.patient_id;

    if (role === "doctor")
      tokenPayload.doctor_id = profile.doctor_id;

    if (role.includes("admin"))
      tokenPayload.admin_id = profile.admin_user_id;



    const token = jwt.sign(

      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }

    );

    /* ================= BUILD PROFILE DATA ================= */

let profileData = null;

if (role === "patient") {

 profileData = {

  dob: details?.dob || null,
  marital_status: details?.marital_status || null,
  occupation: details?.occupation || null,
  blood_group: details?.BloodGroup?.domain_name || null,
  height: details?.height || null,
  weight: details?.weight || null,
  allergies: details?.allergies || [],
  smoking: details?.smoking ?? null,
  alcohol: details?.alcohol ?? null,

  current_address: {
    address_line_1: details?.CurrentAddress?.address_line_1 || null,
    address_line_2: details?.CurrentAddress?.address_line_2 || null,
    city: details?.CurrentAddress?.city || null,
    district: details?.CurrentAddress?.district || null,
    state: details?.CurrentAddress?.state || null,
    country: details?.CurrentAddress?.country || null,
    pin: details?.CurrentAddress?.pin || null
  },

  permanent_address: {
    address_line_1: details?.PermanentAddress?.address_line_1 || null,
    address_line_2: details?.PermanentAddress?.address_line_2 || null,
    city: details?.PermanentAddress?.city || null,
    district: details?.PermanentAddress?.district || null,
    state: details?.PermanentAddress?.state || null,
    country: details?.PermanentAddress?.country || null,
    pin: details?.PermanentAddress?.pin || null
  }

};


}

if (role === "doctor") {
  profileData = {
    dob: details?.dob || null,
    experience_years: details?.experience || null,

    current_address: {
      address_line_1: details?.CurrentAddress?.address_line_1 || null,
      address_line_2: details?.CurrentAddress?.address_line_2 || null,
      city: details?.CurrentAddress?.city || null,
      district: details?.CurrentAddress?.district || null,
      state: details?.CurrentAddress?.state || null,
      country: details?.CurrentAddress?.country || null,
      pin: details?.CurrentAddress?.pin || null
    },
    
    permanent_address: {
      address_line_1: details?.PermanentAddress?.address_line_1 || null,
      address_line_2: details?.PermanentAddress?.address_line_2 || null,
      city: details?.PermanentAddress?.city || null,
      district: details?.PermanentAddress?.district || null,
      state: details?.PermanentAddress?.state || null,
      country: details?.PermanentAddress?.country || null,
      pin: details?.PermanentAddress?.pin || null
    },
    
    doctor_experiences: doctorExperiences.map((exp) => ({
      organization_name: exp.organization_name || null,
      key_experience: exp.key_experience || null,
      start_date: exp.start_date || null,
      end_date: exp.end_date || null,
      experience_desc: exp.experience_desc || null
    }))

    }

}

if (role.includes("admin")) {
  profileData = {

    current_address: {
      address_line_1: details?.CurrentAddress?.address_line_1 || null,
      address_line_2: details?.CurrentAddress?.address_line_2 || null,
      city: details?.CurrentAddress?.city || null,
      district: details?.CurrentAddress?.district || null,
      state: details?.CurrentAddress?.state || null,
      country: details?.CurrentAddress?.country || null,
      pin: details?.CurrentAddress?.pin || null
    },
    
    permanent_address: {
      address_line_1: details?.PermanentAddress?.address_line_1 || null,
      address_line_2: details?.PermanentAddress?.address_line_2 || null,
      city: details?.PermanentAddress?.city || null,
      district: details?.PermanentAddress?.district || null,
      state: details?.PermanentAddress?.state || null,
      country: details?.PermanentAddress?.country || null,
      pin: details?.PermanentAddress?.pin || null
    }
    


}}


    await t.commit();



    return {

      success: true,

      data: {

        token,
        role,
        user: userData,
        profile: profileData,
        menus,
        buttons

      }

    };


  }

  catch (error) {

    await t.rollback();

    console.error("LOGIN ERROR:", error);

    return {

      success: false,
      message: "Login failed"

    };

  }

}



/* =====================================================
   SIGNUP PATIENT
===================================================== */

static async signupPatient(payload) {

  const t = await sequelize.transaction();

  try {

    const {
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      password,
      confirm_password,
      gender
    } = payload;


    if (!email || !phone) {

      await t.rollback();

      return {
        success: false,
        message: "Missing required fields"
      };

    }



    const emailExists = await User.findOne({

      where: { user_name: email },
      transaction: t

    });


    if (emailExists) {

      await t.rollback();

      return {
        success: false,
        message: "Email already registered"
      };

    }



    if (password !== confirm_password) {

      await t.rollback();

      return {
        success: false,
        message: "Password do not match"
      };

    }



    const hashedPassword = await bcrypt.hash(password, 10);


    /* ================= GET ROLE ================= */

    const role = await Role.findOne({

      where: { role_name: "patient" },
      transaction: t

    });


    if (!role) {

      await t.rollback();

      return {
        success: false,
        message: "Role not found"
      };

    }
    
    /* ================= CREATE PATIENT ================= */

    const patient = await Patient.create({

      first_name,
      middle_name,
      last_name,
      email,
      phone_no: phone,
      created_by: role.role_id

    }, { transaction: t });



    /* ================= GENDER ================= */

    let genderId = null;

    if (gender) {

      const lookup = await DomainLookup.findOne({

        where: {
          domain_type: "gender",
          domain_value: gender
        },

        transaction: t

      });

      genderId = lookup?.domain_lookup_id || null;

    }



    await PatientDetails.create({

      patient_id: patient.patient_id,
      gender: genderId

    }, { transaction: t });




    /* ================= CREATE USER ================= */

    const newUser = await User.create({

      user_name: email,
      password: hashedPassword,
      user_type: role.role_id,
      ref_id: patient.patient_id,
      status: "Active",
      created_by: role.role_id

    }, { transaction: t });



    /* ================= MAP ROLE ================= */

    await UserRoleMapping.create({

      user_id: newUser.user_id,
      role_id: role.role_id,
      status: 1

    }, { transaction: t });



    await t.commit();



    return {

      success: true,
      message: "Patient registered successfully",
      data: {
    user_id: newUser.user_id,
    email: newUser.user_name,
    role: role.role_name,
    patient_id: patient.patient_id,
    first_name: patient.first_name,
    middle_name: patient.middle_name,
    last_name: patient.last_name,
    phone_no: patient.phone_no,
    gender: gender || null,
    created_on: newUser.created_on,
    created_by: newUser.created_by
  }

    };


  }

  catch (error) {

    await t.rollback();

    console.error("SIGNUP ERROR:", error);

    return {

      success: false,
      message: error.message

    };

  }

}

/* =====================================================
   GENERATE OTP
===================================================== */

static generateOtp() {

  return Math.floor(100000 + Math.random() * 900000).toString();

}


/* =====================================================
   SEND OTP
===================================================== */

static async sendOtp(email, roleFromUI) {

  const t = await sequelize.transaction();

  try {

    const normalizedRole = roleFromUI?.toLowerCase();

    const user = await User.findOne({
      where: { user_name: email },
      transaction: t
    });

    if (!user) {

      await t.rollback();

      return {
        success: false,
        message: "Email not registered",
        errorCode: "USER_NOT_FOUND"
      };
    }

    /* ================= GET ROLE ================= */

    const roleMapping = await UserRoleMapping.findOne({
      where: {
        user_id: user.user_id,
        status: 1
      },
      include: [{
        model: Role,
        as: "Role",
        attributes: ["role_name"]
      }],
      transaction: t
    });

    if (!roleMapping) {

      await t.rollback();

      return {
        success: false,
        message: "Role not assigned"
      };
    }

    const actualRole = roleMapping.Role.role_name.toLowerCase();

    /* ================= ROLE VALIDATION ================= */

    if (normalizedRole === "admin") {

      if (!["super admin","standard admin","guest admin"].includes(actualRole)) {

        await t.rollback();

        return {
          success: false,
          message: "This account is not registered as admin",
          errorCode: "ROLE_MISMATCH"
        };

      }

    } else {

      if (normalizedRole !== actualRole) {

        await t.rollback();

        return {
          success: false,
          message: `This account is not registered as ${normalizedRole}`,
          errorCode: "ROLE_MISMATCH"
        };

      }

    }

    /* ================= GENERATE OTP ================= */

    const otp = this.generateOtp();

    const token = jwt.sign(
      { email, otp },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`
    );

    await t.commit();

    return {
      success: true,
      message: "OTP sent successfully",
      data: { token }
    };

  }

  catch (error) {

    await t.rollback();

    console.error("SEND OTP ERROR:", error);

    return {
      success: false,
      message: "Failed to send OTP"
    };

  }

}

/* =====================================================
   VERIFY OTP
===================================================== */

static async verifyOtp(otp, token) {

  const t = await sequelize.transaction();

  try {

    if (!token) {

      await t.rollback();

      return {
        success: false,
        message: "Token missing"
      };

    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.otp !== otp) {

      await t.rollback();

      return {
        success: false,
        message: "Invalid OTP"
      };

    }

    await t.commit();

    return {
      success: true,
      email: decoded.email
    };

  }

  catch (error) {

    await t.rollback();

    return {
      success: false,
      message: "OTP verification failed"
    };

  }

}

/* =====================================================
   RESET PASSWORD
===================================================== */

static async resetPassword(password, confirmPassword, token) {

  const t = await sequelize.transaction();

  try {

    if (password !== confirmPassword) {

      await t.rollback();

      return {
        success: false,
        message: "Passwords do not match"
      };

    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.update(

      { password: hashedPassword },

      {
        where: { user_name: decoded.email },
        transaction: t
      }

    );

    await t.commit();

    return {
      success: true,
      message: "Password updated successfully"
    };

  }

  catch (error) {

    await t.rollback();

    console.error("RESET PASSWORD ERROR:", error);

    return {
      success: false,
      message: "Password reset failed"
    };

  }

}

}

module.exports = AuthService;