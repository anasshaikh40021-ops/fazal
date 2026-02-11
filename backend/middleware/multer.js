import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure uploads folder exists (for localhost)
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// IMPORTANT:
// Use memory storage on Vercel
// Use disk storage locally

let storage;

if (process.env.VERCEL) {
  // ✅ Vercel-compatible (NO DISK WRITE)
  storage = multer.memoryStorage();
} else {
  // ✅ Localhost-compatible
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
}

const upload = multer({ storage });

export default upload;
