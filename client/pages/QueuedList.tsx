import { PagePlaceholder } from "@/components/PagePlaceholder";
import { List } from "lucide-react";

export default function QueuedList() {
  return (
    <PagePlaceholder
      icon={<List className="h-8 w-8 text-primary" />}
      title="Queued List"
      description="View and manage numbers waiting to be claimed by team members"
    />
  );
}
