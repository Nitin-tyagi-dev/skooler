import express from "express";
import {
  markAttendance,
  getStudentAttendance,
  getClassAttendanceReport,
} from "../controllers/attendance.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import { markAttendanceSchema } from "../validations/attendance.validation.js";

const router = express.Router();

router.post(
  "/mark",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "teacher", "clerk"]),
  validate(markAttendanceSchema),
  markAttendance
);

router.get(
  "/student/:studentId",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("studentId", "student"),
  getStudentAttendance
);

router.get(
  "/class/:className/:date",
  authMiddleware,
  schoolMiddleware,
  getClassAttendanceReport
);

export default router;
