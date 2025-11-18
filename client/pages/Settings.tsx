import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>(
    user?.profilePictureUrl || "",
  );
  const [previewUrl, setPreviewUrl] = useState<string>(
    user?.profilePictureUrl || "",
  );

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setProfilePicture(file.name);
  };

  const handleUpload = async () => {
    if (!previewUrl || !token) return;

    try {
      setLoading(true);
      setSuccess(false);

      const response = await fetch("/api/profile/upload-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePictureUrl: previewUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const data = await response.json();
      setSuccess(true);
      toast.success("Profile picture updated successfully");

      // Update localStorage
      if (user) {
        const updatedUser = { ...user, profilePictureUrl: previewUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current and Preview */}
            <div className="flex gap-8 items-center">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Current</Label>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profilePictureUrl} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {previewUrl && previewUrl !== user?.profilePictureUrl && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Preview</Label>
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {profilePicture && (
                <p className="text-sm text-muted-foreground">
                  Selected: {profilePicture}
                </p>
              )}

              {success && (
                <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Profile picture updated successfully
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!previewUrl || loading || previewUrl === user?.profilePictureUrl}
                className="w-full"
              >
                {loading ? "Uploading..." : "Upload Picture"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Name</Label>
              <Input value={user?.name || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <Input
                value={user?.role || ""}
                disabled
                className="bg-muted capitalize"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
