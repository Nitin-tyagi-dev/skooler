import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import schoolMiddleware from "./middleware/school.middleware.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import resultRoutes from "./routes/result.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/messages", messageRoutes);

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

app.use(notFound);
app.use(errorHandler);

export default app;
