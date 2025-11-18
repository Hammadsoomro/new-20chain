import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "./routes/auth";

interface ConnectedUser {
  userId: string;
  email: string;
  teamId: string;
  socket: WebSocket;
}

interface WebSocketMessage {
  type:
    | "message"
    | "typing"
    | "message_read"
    | "message_deleted"
    | "message_edited";
  userId: string;
  email: string;
  teamId: string;
  data: any;
}

const connectedUsers = new Map<string, ConnectedUser>();

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, req) => {
    const token = new URL(req.url!, `http://${req.headers.host}`).searchParams.get(
      "token",
    );

    if (!token) {
      ws.close(4001, "Unauthorized");
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      ws.close(4001, "Invalid token");
      return;
    }

    const userId = decoded.id;
    const email = decoded.email;
    const teamId = decoded.id; // In a real app, fetch teamId from user doc

    connectedUsers.set(userId, { userId, email, teamId, socket: ws });

    // Broadcast online status
    broadcastToTeam(teamId, {
      type: "user_online",
      userId,
      email,
    } as any);

    ws.on("message", (messageData: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(messageData.toString());
        message.userId = userId;
        message.email = email;
        message.teamId = teamId;

        switch (message.type) {
          case "typing":
            broadcastToTeam(teamId, message);
            break;
          case "message_read":
            broadcastToTeam(teamId, message);
            break;
          case "message":
          case "message_edited":
          case "message_deleted":
            broadcastToTeam(teamId, message);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      connectedUsers.delete(userId);
      broadcastToTeam(teamId, {
        type: "user_offline",
        userId,
        email,
      } as any);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

export function broadcastToTeam(teamId: string, message: any) {
  connectedUsers.forEach((user) => {
    if (user.teamId === teamId && user.socket.readyState === 1) {
      user.socket.send(JSON.stringify(message));
    }
  });
}

export function broadcastToUser(userId: string, message: any) {
  const user = connectedUsers.get(userId);
  if (user && user.socket.readyState === 1) {
    user.socket.send(JSON.stringify(message));
  }
}
