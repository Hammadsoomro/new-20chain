import { Layout } from "@/components/Layout";
import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Clock } from "lucide-react";

export default function NumbersInbox() {
  return (
    <Layout>
      <PagePlaceholder
        icon={<Clock className="h-8 w-8 text-primary" />}
        title="Numbers Inbox"
        description="Claim your allocated numbers with cooldown timer and status indicators"
      />
    </Layout>
  );
}
