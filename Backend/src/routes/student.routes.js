import express from "express";
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent
} from "../controllers/student.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "clerk"]),
  createStudent
);

router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  getStudents
);

router.put(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "clerk"]),
  updateStudent
);

router.delete(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  deleteStudent
);


export default router;
