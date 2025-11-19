import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleSignup } from "./routes/auth";
import { addToQueue, getQueuedLines, clearQueuedLine } from "./routes/queued";
import { addToHistory, getHistory, searchHistory } from "./routes/history";
import {
  getOrCreateGroupChat,
  sendMessage,
  getMessages,
  addMemberToGroup,
  setTyping,
  getTypingStatus,
  markMessageAsRead,
  editMessage,
  deleteMessage,
} from "./routes/chat";
import { createTeamMember, getTeamMembers } from "./routes/members";
import {
  uploadProfilePicture,
  getProfile,
  updateName,
  changePassword,
} from "./routes/profile";
import {
  getClaimSettings,
  updateClaimSettings,
  claimNumbers,
  getClaimedNumbers,
  releaseClaimedNumbers,
} from "./routes/claim";
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
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
  app.use("/api/chat", authMiddleware);
  app.use("/api/members", authMiddleware);
  app.use("/api/profile", authMiddleware);

  // Queued list routes
  app.post("/api/queued/add", addToQueue);
  app.get("/api/queued", getQueuedLines);
  app.delete("/api/queued/:lineId", clearQueuedLine);

  // History routes
  app.post("/api/history/add", addToHistory);
  app.get("/api/history", getHistory);
  app.get("/api/history/search", searchHistory);

  // Chat routes
  app.get("/api/chat/group", getOrCreateGroupChat);
  app.post("/api/chat/send", sendMessage);
  app.get("/api/chat/messages", getMessages);
  app.post("/api/chat/group/add-member", addMemberToGroup);
  app.post("/api/chat/typing", setTyping);
  app.get("/api/chat/typing", getTypingStatus);
  app.post("/api/chat/mark-read", markMessageAsRead);
  app.post("/api/chat/edit", editMessage);
  app.post("/api/chat/delete", deleteMessage);

  // Member routes
  app.get("/api/members", getTeamMembers);
  app.post("/api/members", createTeamMember);

  // Profile routes
  app.get("/api/profile", getProfile);
  app.post("/api/profile/upload-picture", uploadProfilePicture);
  app.post("/api/profile/update-name", updateName);
  app.post("/api/profile/change-password", changePassword);

  // Claim routes (protected)
  app.use("/api/claim", authMiddleware);
  app.get("/api/claim/settings", getClaimSettings);
  app.put("/api/claim/settings", updateClaimSettings);
  app.post("/api/claim", claimNumbers);
  app.get("/api/claim/numbers", getClaimedNumbers);
  app.post("/api/claim/release", releaseClaimedNumbers);

  return app;
}
