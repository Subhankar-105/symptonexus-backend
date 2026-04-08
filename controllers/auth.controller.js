const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {

  // ===================== LOGIN =====================
  static login = asyncHandler(async (req, res) => {
    try {
      const { email, password, role } = req.body;

      const result = await AuthService.login(email, password, role);

      //  Defensive check (VERY IMPORTANT)
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {}
        );
      }

      return res.sendResponse(
        result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
        result.message || "",
        result.data || {},
        result.errorCode || null
      );

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again.",
        {}
      );
    }
  });

  // ===================== SIGNUP =====================
 static signupPatient = asyncHandler(async (req, res) => {
  try {
    const result = await AuthService.signupPatient(req.body);

    // Defensive check
    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {},
        "INVALID_RESPONSE"
      );
    }

    //  Business failure (EMAIL EXISTS, PASSWORD MISMATCH, etc.)
  if (!result.success) {
  return res.sendResponse(
    res.STATUS.BUSINESS_ERROR,     // 400
    result.message,
    {},
    result.errorCode,
    false                          // IMPORTANT
  );
}

return res.sendResponse(
  res.STATUS.SUCCESS,             // 200
  "Signup successful",
  result.data,
  null,
  true
);

  } catch (error) {
    console.error("Signup Patient Error:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );
  }
});

// ===================== SEND OTP =====================
static sendOtp = asyncHandler(async (req, res) => {

  const { email, role } = req.body;  

  const result = await AuthService.sendOtp(email, role);

  if (!result || typeof result.success !== "boolean") {
    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Invalid server response",
      {}
    );
  }

  return res.sendResponse(
    result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
    result.message || "",
    result.data || {},
    result.errorCode || null
  );

});


  // ===================== VERIFY OTP =====================
  static verifyOtp = asyncHandler(async (req, res) => {

    const { otp, token } = req.body;

    const result = await AuthService.verifyOtp(otp, token);

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {}
      );
    }

    return res.sendResponse(
      result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
      result.message || "",
      result.data || {},
      result.errorCode || null
    );

  });


  // ===================== RESET PASSWORD =====================
  static resetPassword = asyncHandler(async (req, res) => {

    const { password, confirmPassword, token } = req.body;

    const result = await AuthService.resetPassword(
      password,
      confirmPassword,
      token
    );

    if (!result || typeof result.success !== "boolean") {
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Invalid server response",
        {}
      );
    }

    return res.sendResponse(
      result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
      result.message || "",
      result.data || {},
      result.errorCode || null
    );

  });

}



module.exports = AuthController;
