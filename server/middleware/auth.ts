import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../routes/auth";

export interface AuthRequest extends Request {
  userId: string;
  email: string;
  role: string;
  teamId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.userId = decoded.id;
    req.email = decoded.email;
    req.role = decoded.role;

    // Extract teamId from user document
    // This will be populated by looking up the user in the database
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};
