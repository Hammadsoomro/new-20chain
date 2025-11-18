import { RequestHandler } from "express";
import { z } from "zod";
import type { QueuedLine } from "@shared/api";
import crypto from "crypto";

// Demo storage
const queuedLines: Map<string, QueuedLine> = new Map();

export const addToQueue: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      lines: z.array(z.string()).min(1),
    });

    const validated = schema.parse(req.body);
    const teamId = (req as any).teamId || "default-team";
    const userId = (req as any).userId || "admin";

    const addedLines: QueuedLine[] = [];

    for (const content of validated.lines) {
      const id = crypto.randomBytes(8).toString("hex");
      const line: QueuedLine = {
        _id: id,
        content,
        addedBy: userId,
        addedAt: new Date().toISOString(),
        teamId,
      };
      queuedLines.set(id, line);
      addedLines.push(line);
    }

    res.json({ success: true, lines: addedLines });
  } catch (error) {
    console.error("Add to queue error:", error);
    res.status(400).json({ error: "Invalid request" });
  }
};

export const getQueuedLines: RequestHandler = async (req, res) => {
  try {
    const teamId = (req as any).teamId || "default-team";
    const lines = Array.from(queuedLines.values()).filter(
      (line) => line.teamId === teamId
    );
    res.json({ lines });
  } catch (error) {
    console.error("Get queued lines error:", error);
    res.status(400).json({ error: "Failed to fetch queued lines" });
  }
};

export const clearQueuedLine: RequestHandler = async (req, res) => {
  try {
    const { lineId } = req.params;
    const line = queuedLines.get(lineId);

    if (!line) {
      res.status(404).json({ error: "Line not found" });
      return;
    }

    const teamId = (req as any).teamId || "default-team";
    if (line.teamId !== teamId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    queuedLines.delete(lineId);
    res.json({ success: true });
  } catch (error) {
    console.error("Clear queued line error:", error);
    res.status(400).json({ error: "Failed to clear line" });
  }
};
