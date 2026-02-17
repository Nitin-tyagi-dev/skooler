import express from "express";
import { registerSchoolAdmin, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerSchoolAdmin);
router.post("/login", login);

export default router;
