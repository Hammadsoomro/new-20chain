import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  AlertCircle,
  Check,
  User,
  Users,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, token, isAdmin } = useAuth();
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

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

      setSuccess(true);
      toast.success("Profile picture updated successfully");

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
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account, team, and preferences
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>

              {isAdmin && (
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
              )}

              {isAdmin && (
                <TabsTrigger value="sorter" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sorter</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
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
                      <Label className="text-sm text-muted-foreground">
                        Current
                      </Label>
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.profilePictureUrl} />
                        <AvatarFallback className="bg-primary/20 text-primary text-lg">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {previewUrl && previewUrl !== user?.profilePictureUrl && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Preview
                        </Label>
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
                      disabled={
                        !previewUrl ||
                        loading ||
                        previewUrl === user?.profilePictureUrl
                      }
                      className="w-full"
                    >
                      {loading ? "Uploading..." : "Upload Picture"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                      className="bg-muted"
                    />
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
            </TabsContent>

            {/* Team Management Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                      Manage your team members and their roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Team Management
                          </p>
                          <p className="text-sm text-blue-800 mt-1">
                            View all team members, create new team members, and
                            manage their roles in the Settings section
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-4">
                          Features
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            View all team members and their profiles
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Create new team members with custom credentials
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Auto-add members to group chat
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            View member creation date and status
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Sorter Settings Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="sorter" className="space-y-6">
                <SorterSettingsPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
