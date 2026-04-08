const STATUS = require("../constants/statusCodes");

module.exports = (req, res, next) => {

  // attach status constants
  res.STATUS = STATUS;

  res.sendResponse = (status, message = "", data = {}, errorCode = null) => {
    return res.status(status).json({
      success: status < 400,
      message,
      data,
      errorCode
    });
  };

  next();
};
