import multer from "multer";
import path from "path";

/* ===========================
   MULTER STORAGE (DISK)
=========================== */
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

/* ===========================
   FILE FILTER (IMAGES ONLY)
=========================== */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

/* ===========================
   EXPORT UPLOAD
=========================== */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
