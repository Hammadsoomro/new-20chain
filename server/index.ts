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
import { uploadProfilePicture, getProfile } from "./routes/profile";
import { connectDB } from "./db";
import { authMiddleware } from "./middleware/auth";
import { getCollections } from "./db";
import { Server } from "socket.io";
import http from "http";

export let io: Server;
let httpServer: http.Server;

export function getIO() {
  return io;
}

export function getHttpServer() {
  return httpServer;
}

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
  httpServer = http.createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

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
  app.use("/api/chat", authMiddleware);
  app.use("/api/members", authMiddleware);

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

  // WebSocket setup for real-time chat
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a chat room
    socket.on("join-chat", (data: { chatId: string; userId: string }) => {
      socket.join(data.chatId);
      console.log(`User ${data.userId} joined chat ${data.chatId}`);
      socket.broadcast.to(data.chatId).emit("user-joined", {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // User sends a message
    socket.on(
      "send-message",
      (data: {
        messageId: string;
        sender: string;
        senderName: string;
        chatId: string;
        content: string;
        timestamp: string;
      }) => {
        io.to(data.chatId).emit("new-message", data);
      },
    );

    // User is typing
    socket.on(
      "typing",
      (data: {
        chatId: string;
        userId: string;
        senderName: string;
        isTyping: boolean;
      }) => {
        socket.broadcast.to(data.chatId).emit("user-typing", {
          userId: data.userId,
          senderName: data.senderName,
          isTyping: data.isTyping,
        });
      },
    );

    // User marks message as read
    socket.on("message-read", (data: { messageId: string; userId: string }) => {
      io.emit("message-read", data);
    });

    // User edits a message
    socket.on(
      "edit-message",
      (data: { messageId: string; content: string; chatId: string }) => {
        io.to(data.chatId).emit("message-edited", data);
      },
    );

    // User deletes a message
    socket.on(
      "delete-message",
      (data: { messageId: string; chatId: string }) => {
        io.to(data.chatId).emit("message-deleted", data);
      },
    );

    // User leaves a chat
    socket.on("leave-chat", (data: { chatId: string }) => {
      socket.leave(data.chatId);
      console.log(`User left chat ${data.chatId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return app;
}
