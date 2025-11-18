import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={<Settings className="h-8 w-8 text-primary" />}
      title="Settings"
      description="Manage team members, claim settings, and preferences"
    />
  );
}
