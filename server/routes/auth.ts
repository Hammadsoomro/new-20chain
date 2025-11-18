import { RequestHandler } from "express";
import { z } from "zod";
import type { LoginRequest, SignupRequest, AuthResponse, User } from "@shared/api";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Demo users storage (in production, use MongoDB)
const users: Map<string, User & { password: string; teamId: string }> = new Map();
const jwtSecret = process.env.JWT_SECRET || "demo-secret-key-change-in-production";

// Helper: Hash password (demo - use bcrypt in production)
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Helper: Create JWT token
const createToken = (user: User): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "7d" }
  );
};

// Signup - Creates admin account
export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const body = req.body as SignupRequest;

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
    });

    const validated = schema.parse(body);

    // Check if user exists
    const existing = Array.from(users.values()).find(
      (u) => u.email === validated.email
    );
    if (existing) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Create admin user with new team
    const teamId = crypto.randomBytes(8).toString("hex");
    const userId = crypto.randomBytes(8).toString("hex");
    const hashedPassword = hashPassword(validated.password);

    const newUser: User & { password: string; teamId: string } = {
      _id: userId,
      email: validated.email,
      name: validated.name,
      role: "admin",
      teamId,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.set(userId, newUser);

    const user: User = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      teamId: newUser.teamId,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    const token = createToken(user);
    const response: AuthResponse = { token, user };

    res.status(201).json(response);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error: "Invalid request" });
  }
};

// Login
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const body = req.body as LoginRequest;

    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const validated = schema.parse(body);
    const hashedPassword = hashPassword(validated.password);

    // Find user
    const userRecord = Array.from(users.values()).find(
      (u) => u.email === validated.email && u.password === hashedPassword
    );

    if (!userRecord) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user: User = {
      _id: userRecord._id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      teamId: userRecord.teamId,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    const token = createToken(user);
    const response: AuthResponse = { token, user };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Invalid request" });
  }
};

// Verify token middleware
export const verifyToken = (token: string): { id: string; email: string; role: string } | null => {
  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
};
