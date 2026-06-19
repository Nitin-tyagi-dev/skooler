import express from "express";
import {
  createResult,
  updateResult,
  downloadResultPDF,
  getStudentResult,
} from "../controllers/result.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import {
  createResultSchema,
  updateResultSchema,
} from "../validations/result.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "teacher"]),
  validate(createResultSchema),
  createResult
);

router.put(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "teacher"]),
  validateObjectIdParam("id", "result"),
  validate(updateResultSchema),
  updateResult
);

router.get(
  "/:id/pdf",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("id", "result"),
  downloadResultPDF
);

router.get(
  "/student/:studentId/:academicYear",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("studentId", "student"),
  getStudentResult
);

export default router;
