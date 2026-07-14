import express from "express";
import {
  getContacts,
  getMessages,
  sendMessage,
  markRead,
} from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import schoolMiddleware from "../middleware/school.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import validateObjectIdParam from "../middleware/validateObjectId.middleware.js";
import { sendMessageSchema } from "../validations/message.validation.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);
router.use(roleMiddleware(["school_admin", "teacher"]));

router.get("/contacts", getContacts);
router.get("/:contactId", validateObjectIdParam("contactId", "contact"), getMessages);
router.post("/", validate(sendMessageSchema), sendMessage);
router.put("/:contactId/read", validateObjectIdParam("contactId", "contact"), markRead);

export default router;
