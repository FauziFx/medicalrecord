const multer = require("multer");

const imagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadImages = multer({
  storage: imagesStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      const error = new Error(
        "The uploaded file must be an image in JPEG or PNG format"
      );
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }
  },
});

exports.uploadImages = uploadImages;
