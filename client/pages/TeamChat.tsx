import { PagePlaceholder } from "@/components/PagePlaceholder";
import { MessageSquare } from "lucide-react";

export default function TeamChat() {
  return (
    <PagePlaceholder
      icon={<MessageSquare className="h-8 w-8 text-primary" />}
      title="Team Chat"
      description="Real-time messaging with your team members and group chat"
    />
  );
}
