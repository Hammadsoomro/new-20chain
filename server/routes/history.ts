import { RequestHandler } from "express";
import { z } from "zod";
import type { HistoryEntry } from "@shared/api";
import crypto from "crypto";

// Demo storage
const historyEntries: Map<string, HistoryEntry> = new Map();

export const addToHistory: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      content: z.string(),
      claimedBy: z.string(),
    });

    const validated = schema.parse(req.body);
    const teamId = (req as any).teamId || "default-team";

    const id = crypto.randomBytes(8).toString("hex");
    const entry: HistoryEntry = {
      _id: id,
      content: validated.content,
      claimedBy: validated.claimedBy,
      claimedAt: new Date().toISOString(),
      teamId,
    };

    historyEntries.set(id, entry);
    res.json({ success: true, entry });
  } catch (error) {
    console.error("Add to history error:", error);
    res.status(400).json({ error: "Invalid request" });
  }
};

export const getHistory: RequestHandler = async (req, res) => {
  try {
    const teamId = (req as any).teamId || "default-team";
    const userId = (req as any).userId || "";
    const isAdmin = (req as any).isAdmin || false;
    const { search, date } = req.query;

    let entries = Array.from(historyEntries.values()).filter(
      (entry) => entry.teamId === teamId
    );

    // Filter by user if not admin
    if (!isAdmin) {
      entries = entries.filter((entry) => entry.claimedBy === userId);
    }

    // Filter by search query
    if (search && typeof search === "string") {
      entries = entries.filter((entry) =>
        entry.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by date
    if (date && typeof date === "string") {
      const filterDate = new Date(date).toDateString();
      entries = entries.filter(
        (entry) => new Date(entry.claimedAt).toDateString() === filterDate
      );
    }

    res.json({ entries });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(400).json({ error: "Failed to fetch history" });
  }
};

export const searchHistory: RequestHandler = async (req, res) => {
  try {
    const teamId = (req as any).teamId || "default-team";
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query required" });
      return;
    }

    const entries = Array.from(historyEntries.values())
      .filter((entry) => entry.teamId === teamId)
      .filter((entry) =>
        entry.content.toLowerCase().includes(query.toLowerCase())
      );

    res.json({ entries });
  } catch (error) {
    console.error("Search history error:", error);
    res.status(400).json({ error: "Search failed" });
  }
};
