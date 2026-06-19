import express from "express";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validations/subject.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validate(createSubjectSchema),
  createSubject
);

router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  getSubjects
);

router.get(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("id", "subject"),
  getSubjectById
);

router.put(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validateObjectIdParam("id", "subject"),
  validate(updateSubjectSchema),
  updateSubject
);

router.delete(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validateObjectIdParam("id", "subject"),
  deleteSubject
);

export default router;
