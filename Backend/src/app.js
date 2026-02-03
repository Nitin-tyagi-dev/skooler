import express from "express";
import cors from "cors";

const app = express();

// core middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Skooler backend running",
  });
});

export default app;
