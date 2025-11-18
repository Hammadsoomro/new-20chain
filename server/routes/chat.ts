import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { getCollections } from "../db";
import { ObjectId } from "mongodb";
import type { ChatMessage, ChatGroup } from "@shared/api";

// Get or create team group chat
export const getOrCreateGroupChat: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    if (!req.teamId) {
      res.status(401).json({ error: "Team not found" });
      return;
    }

    const collections = getCollections();
    let group = await collections.chatGroups.findOne({
      teamId: req.teamId,
      name: "Team Chat",
    });

    if (!group) {
      const result = await collections.chatGroups.insertOne({
        name: "Team Chat",
        teamId: req.teamId,
        members: [req.userId],
        createdAt: new Date().toISOString(),
      });

      group = {
        _id: result.insertedId.toString(),
        name: "Team Chat",
        teamId: req.teamId,
        members: [req.userId],
        createdAt: new Date().toISOString(),
      };
    }

    res.json(group);
  } catch (error) {
    console.error("Error getting group chat:", error);
    res.status(500).json({ error: "Failed to get group chat" });
  }
};

// Get team members
export const getTeamMembers: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.teamId) {
      res.status(401).json({ error: "Team not found" });
      return;
    }

    const collections = getCollections();
    const members = await collections.users
      .find({ teamId: req.teamId })
      .toArray();

    const formattedMembers = members.map((member) => ({
      _id: member._id.toString(),
      email: member.email,
      name: member.name,
      role: member.role,
      profilePicture: member.profilePicture,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error("Error getting team members:", error);
    res.status(500).json({ error: "Failed to get team members" });
  }
};

// Send message (1-on-1 or group)
export const sendMessage: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.teamId) {
      res.status(401).json({ error: "Team not found" });
      return;
    }

    const { content, recipient, groupId } = req.body;

    if (!content) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    if (!recipient && !groupId) {
      res
        .status(400)
        .json({ error: "Either recipient or groupId is required" });
      return;
    }

    const collections = getCollections();

    // Get sender info
    const sender = await collections.users.findOne({
      _id: new ObjectId(req.userId),
    });

    const message: any = {
      sender: req.userId,
      senderName: sender?.name || "Unknown",
      senderPicture: sender?.profilePicture,
      content,
      createdAt: new Date().toISOString(),
      teamId: req.teamId,
    };

    if (recipient) {
      message.recipient = recipient;
    }

    if (groupId) {
      message.groupId = groupId;
    }

    const result = await collections.chatMessages.insertOne(message);

    res.json({
      _id: result.insertedId.toString(),
      ...message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get messages for a chat (1-on-1 or group)
export const getMessages: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.teamId) {
      res.status(401).json({ error: "Team not found" });
      return;
    }

    const { recipient, groupId } = req.query;

    if (!recipient && !groupId) {
      res
        .status(400)
        .json({ error: "Either recipient or groupId is required" });
      return;
    }

    const collections = getCollections();
    let query: any = { teamId: req.teamId };

    if (recipient) {
      query.$or = [
        { sender: req.userId, recipient: recipient as string },
        { sender: recipient as string, recipient: req.userId },
      ];
    } else if (groupId) {
      query.groupId = groupId;
    }

    const messages = await collections.chatMessages
      .find(query)
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id.toString(),
      sender: msg.sender,
      senderName: msg.senderName,
      senderPicture: msg.senderPicture,
      recipient: msg.recipient,
      groupId: msg.groupId,
      content: msg.content,
      createdAt: msg.createdAt,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

// Add member to group chat
export const addMemberToGroup: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    if (!req.teamId) {
      res.status(401).json({ error: "Team not found" });
      return;
    }

    const { groupId, memberId } = req.body;

    const collections = getCollections();
    const result = await collections.chatGroups.findOneAndUpdate(
      { _id: new ObjectId(groupId), teamId: req.teamId },
      {
        $addToSet: { members: memberId },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.json(result.value);
  } catch (error) {
    console.error("Error adding member to group:", error);
    res.status(500).json({ error: "Failed to add member to group" });
  }
};
