import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleSignup } from "./routes/auth";
import { addToQueue, getQueuedLines, clearQueuedLine } from "./routes/queued";
import { addToHistory, getHistory, searchHistory } from "./routes/history";
import {
  getOrCreateGroupChat,
  getTeamMembers,
  sendMessage,
  getMessages,
  addMemberToGroup,
} from "./routes/chat";
import { connectDB } from "./db";
import { authMiddleware } from "./middleware/auth";
import { getCollections } from "./db";

export async function createServer() {
  // Initialize MongoDB connection
  try {
    await connectDB();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware to populate teamId and role from database (after auth middleware)
  app.use((req, res, next) => {
    // This will be set by authMiddleware, we just ensure it's available
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);

  // Protected routes
  app.use("/api/queued", authMiddleware);
  app.use("/api/history", authMiddleware);

  // Queued list routes
  app.post("/api/queued/add", addToQueue);
  app.get("/api/queued", getQueuedLines);
  app.delete("/api/queued/:lineId", clearQueuedLine);

  // History routes
  app.post("/api/history/add", addToHistory);
  app.get("/api/history", getHistory);
  app.get("/api/history/search", searchHistory);

  return app;
}
