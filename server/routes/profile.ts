import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { getCollections } from "../db";
import { ObjectId } from "mongodb";

// Upload profile picture
export const uploadProfilePicture: RequestHandler = async (
  req: AuthRequest,
  res,
) => {
  try {
    const { profilePictureUrl } = req.body;

    if (!profilePictureUrl) {
      res.status(400).json({ error: "Profile picture URL is required" });
      return;
    }

    const collections = getCollections();
    const result = await collections.users.findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      {
        $set: {
          profilePictureUrl,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updatedUser = {
      _id: result.value._id.toString(),
      email: result.value.email,
      name: result.value.name,
      role: result.value.role,
      profilePictureUrl: result.value.profilePictureUrl,
      teamId: result.value.teamId,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };

    res.json(updatedUser);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

// Get profile
export const getProfile: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const collections = getCollections();
    const user = await collections.users.findOne({
      _id: new ObjectId(req.userId),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userProfile = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
      teamId: user.teamId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};
