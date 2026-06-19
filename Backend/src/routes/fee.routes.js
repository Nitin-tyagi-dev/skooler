import express from "express";
import {
  createFeeStructure,
  addPayment,
  getLedger,
  getFinancialDashboard,
  getPendingStudents,
  refundPayment
} from "../controllers/fee.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import { paymentSchema, feeStructureSchema, refundSchema } from "../validations/fee.validation.js";

const router = express.Router();

router.post(
  "/structure",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validate(feeStructureSchema),
  createFeeStructure
);

router.post(
  "/payment",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "accountant"]),
  validate(paymentSchema), 
  addPayment
);

router.get(
  "/ledger/:studentId/:academicYear",
  authMiddleware,
  schoolMiddleware,
  validateObjectIdParam("studentId", "student"),
  getLedger
);

router.get(
  "/dashboard/:academicYear",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "accountant"]),
  getFinancialDashboard
);

router.get(
  "/pending/:academicYear",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin", "accountant"]),
  getPendingStudents
);
router.post(
  "/refund",
  authMiddleware,
  schoolMiddleware,
  roleMiddleware(["school_admin"]),
  validate(refundSchema),
  refundPayment
);

export default router;
