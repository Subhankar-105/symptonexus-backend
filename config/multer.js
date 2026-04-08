const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({

  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
        "application/pdf",

    ];

    if (allowedTypes.includes(file.mimetype)) {

      cb(null, true);

    } else {

      cb(new Error("Only PDF "), false);

    }

  }

});

module.exports = upload;
