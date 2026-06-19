import express from "express";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/:academicYear",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  getAdminDashboard
);

export default router;
