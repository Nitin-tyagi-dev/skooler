import express from "express";
import {
  uploadLogo,
  getSchoolProfile,
  updateSchoolProfile,
} from "../controllers/school.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  uploadSchoolLogo,
  handleUpload,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  getSchoolProfile
);

router.put(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  updateSchoolProfile
);

router.put(
  "/logo",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  handleUpload(uploadSchoolLogo),
  uploadLogo
);

export default router;
