const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

/* ================= IMPORT MODELS ================= */

const User = require("../models/User");
const Admin = require("../models/Admin_user");
const AdminUserDetails = require("../models/Admin_user_Details");
const Address = require("../models/Address");
const DomainLookup = require("../models/Domain_lookup");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");


class AdminService {

  /* =====================================================
      CREATE ADMIN (ONLY ROLE 2 AND 3 ALLOWED)
  ===================================================== */

  static async createAdmin(payload, createdBy = null) {

    const t = await sequelize.transaction();

    try {

      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        admin_type,
        department_id,
        gender,
        password,
        confirm_password,
      } = payload;

      /* VALIDATIONS */

      if (!first_name || !email || !password || !confirm_password || !admin_type) {

        await t.rollback();

        return {
          success: false,
          message: "Required fields missing"
        };

      }

      if (password !== confirm_password) {

        await t.rollback();

        return {
          success: false,
          message: "Password mismatch"
        };

      }

      if (![2, 3].includes(admin_type)) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid admin type"
        };

      }

    if (admin_type == 2 && (!department_id || department_id.length === 0)) {

        await t.rollback();

        return {
          success: false,
          message: "Department is required for Standard Admin"
        };

      }

      /* CHECK EMAIL */

      const userExists = await User.findOne({
        where: { user_name: email },
        transaction: t
      });

      if (userExists) {

        await t.rollback();

        return {
          success: false,
          message: "Email already exists"
        };

      }

      /* GET ROLE */

      const role = await Role.findByPk(admin_type, {
        transaction: t
      });

      /* FIX: validate role exists */

      if (!role) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid admin role"
        };

      }

      /* GET GENDER */

      let genderId = null;

      if (gender) {

        const genderLookup = await DomainLookup.findOne({

          where: {
            domain_type: "gender",
            domain_value: gender
          },

          transaction: t

        });

        genderId = genderLookup?.domain_lookup_id || null;

      }

      /* CREATE ADMIN */

      const admin = await Admin.create({

        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender: genderId,
        department_id:
        admin_type == 2
      ? department_id.join(",")  
      : null,
        status: "Active",
        created_by: createdBy   // role_id

      }, { transaction: t });

      /* CREATE USER */

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({

        user_name: email,
        password: hashedPassword,
        user_type: role.role_id,
        ref_id: admin.admin_user_id,
        status: "Active",
        created_by: createdBy   // role_id

      }, { transaction: t });

      /* ROLE MAPPING */

      await UserRoleMapping.create({

        user_id: newUser.user_id,
        role_id: role.role_id,
        status: 1

      }, { transaction: t });

      /* COMMIT TRANSACTION */

      await t.commit();

      /* FETCH CREATOR ROLE NAME USING role_id */

      let creatorRole = null;

if (createdBy) {
  creatorRole = await Role.findByPk(createdBy, {
    attributes: ["role_id", "role_name"]
  });
}
      /* RESPONSE */

      return {

        success: true,

        message: "Admin created successfully",

        data: {

          admin_user_id: admin.admin_user_id,

          first_name: admin.first_name,

          last_name: admin.last_name,

          email: admin.email,

          role: role.role_name,

          department_id:
  admin.department_id
    ? admin.department_id.split(",").map(Number)
    : [],

          created_by: creatorRole?.role_name || null

        }

      };

    }

    catch (error) {

      if (t && !t.finished) {
        await t.rollback();
      }

      console.error("CREATE ADMIN ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }
  /* =====================================================
    GET ALL ADMINS
  ===================================================== */

 static async getAllAdmins() {
  try {

    const admins = await Admin.findAll({
      attributes: [
        "admin_user_id",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_no",
        "created_on",
        "status",
        "department_id"
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "user_type"],
          where: {
            user_type: [1, 2, 3]
          },
          include: [
            {
              model: UserRoleMapping,
              as: "UserRoleMappings",
              attributes: ["role_id"],
              include: [
                {
                  model: Role,
                  as: "Role",
                  attributes: ["role_id", "role_name"]
                }
              ]
            }
          ]
        },

            {
              model: DomainLookup,
              as: "genderLookup",
              attributes: ["domain_name"],
              where: { domain_type: "gender" },
              required: false
            },

          {
            model: AdminUserDetails,
            as: "admin_detail",
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
            ]
        }

      ]


      });

    /* ================= FORMAT RESPONSE ================= */

    const result = admins.map((admin) => {
      return {
        admin_user_id: admin.admin_user_id,
        first_name: admin.first_name,
        middle_name: admin.middle_name,
        last_name: admin.last_name,
        email: admin.email,
        phone_no: admin.phone_no,
        dob: admin.admin_detail?.dob,

        gender: admin?.genderLookup?.domain_name || null,

        role:
          admin.user?.UserRoleMappings?.[0]?.Role?.role_name ||
          "Unknown",

        department_id: admin.department_id
          ? admin.department_id.split(",").map(id => Number(id.trim()))
          : [],

        created_on: admin.created_on
  ? admin.created_on.toISOString().split("T")[0]
  : null,
        status: admin.status,

        current_address: {
      address_line_1: admin.admin_detail?.CurrentAddress?.address_line_1 || null,
      address_line_2: admin.admin_detail?.CurrentAddress?.address_line_2 || null,
      city: admin.admin_detail?.CurrentAddress?.city || null,
      district: admin.admin_detail?.CurrentAddress?.district || null,
      state: admin.admin_detail?.CurrentAddress?.state || null,
      country: admin.admin_detail?.CurrentAddress?.country || null,
      pin: admin.admin_detail?.CurrentAddress?.pin || null
        },
        permanet_address: {
      address_line_1: admin.admin_detail?.PermanentAddress?.address_line_1 || null,
      address_line_2: admin.admin_detail?.PermanentAddress?.address_line_2 || null,
      city: admin.admin_detail?.PermanentAddress?.city || null,
      district: admin.admin_detail?.PermanentAddress?.district || null,
      state: admin.admin_detail?.PermanentAddress?.state || null,
      country: admin.admin_detail?.PermanentAddress?.country || null,
      pin: admin.admin_detail?.PermanentAddress?.pin || null
        }
      };
    });

    return {
      success: true,
      data: result
    };

  } catch (error) {

    console.error("GET ADMINS ERROR:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

  /* Admin status Update */ 
static async deactivateAdmin(admin_user_id, updatedBy = null) {
  const t = await sequelize.transaction();

  try {
    if (!admin_user_id) {
      await t.rollback();
      return {
        success: false,
        message: "admin_user_id is required"
      };
    }

    const admin = await Admin.findByPk(admin_user_id, { transaction: t });

    if (!admin) {
      await t.rollback();
      return {
        success: false,
        message: "Admin not found"
      };
    }

    if (admin.status === "Inactive") {
      await t.rollback();
      return {
        success: false,
        message: "Admin is already inactive"
      };
    }

    await admin.update(
      {
        status: "Inactive",
        updated_by: updatedBy
      },
      { transaction: t }
    );

    const [updatedUserCount] = await User.update(
      { status: "Inactive" },
      {
        where: { ref_id: admin_user_id },
        transaction: t
      }
    );

    if (updatedUserCount === 0) {
      await t.rollback();
      return {
        success: false,
        message: "User status update failed"
      };
    }

    await t.commit();

    return {
      success: true,
      message: "Admin deactivated successfully",
      data: {
        admin_user_id: admin.admin_user_id,
        first_name: admin.first_name,
        middle_name: admin.middle_name,
        last_name: admin.last_name,
        email: admin.email,
        status: admin.status
      }
    };
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    console.error("DEACTIVATE ADMIN ERROR:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

}

module.exports = AdminService;
