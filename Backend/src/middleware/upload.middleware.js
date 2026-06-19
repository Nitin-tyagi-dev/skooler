import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "../../uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsRoot, subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname).toLowerCase();
      if (!ext) {
        const mimeToExt = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/webp": ".webp",
        };
        ext = mimeToExt[file.mimetype] || ".jpg";
      }
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

// Ensure upload directories exist at startup
ensureDir(path.join(uploadsRoot, "students"));
ensureDir(path.join(uploadsRoot, "logos"));

const imageFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
};

export const uploadStudentPhoto = multer({
  storage: createStorage("students"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("photo");

export const uploadSchoolLogo = multer({
  storage: createStorage("logos"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("logo");

export const handleUpload =
  (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
