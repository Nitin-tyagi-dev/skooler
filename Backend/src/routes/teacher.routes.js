import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "../validations/teacher.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validate(createTeacherSchema),
  createTeacher
);

router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  getTeachers
);

router.get(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("id", "teacher"),
  getTeacherById
);

router.put(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validateObjectIdParam("id", "teacher"),
  validate(updateTeacherSchema),
  updateTeacher
);

router.delete(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validateObjectIdParam("id", "teacher"),
  deleteTeacher
);

export default router;
