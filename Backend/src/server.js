import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Socket authentication middleware using JWT token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Join a room named after user's own ID
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      // Clean up
    });
  });

  // Attach socketio to express app to use in controllers
  app.set("socketio", io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
