import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import schoolMiddleware from "./middleware/school.middleware.js";
import studentRoutes from "./routes/student.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Skooler backend running" });
});

app.get(
  "/api/protected",
  authMiddleware,
  schoolMiddleware,
  (req, res) => {
    res.json({
      message: "Protected route accessed",
      user: req.user,
      schoolId: req.schoolId,
    });
  }
);

export default app;
