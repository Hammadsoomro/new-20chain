import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Clock } from "lucide-react";

export default function History() {
  return (
    <PagePlaceholder
      icon={<Clock className="h-8 w-8 text-primary" />}
      title="History"
      description="Track and search claimed numbers with filters and timestamps"
    />
  );
}
