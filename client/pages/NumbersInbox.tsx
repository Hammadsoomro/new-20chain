import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface InboxItem {
  _id: string;
  content: string;
  claimedAt: string;
  cooldownUntil?: string;
  status: "claimed" | "cooldown" | "available";
}

export default function NumbersInbox() {
  const { token, user } = useAuth();
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cooldownMinutes, setCooldownMinutes] = useState(5);

  // Fetch inbox data - simulating user's claimed numbers
  useEffect(() => {
    const fetchInbox = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const userEntries = data.entries || [];

          // Transform history entries to inbox format
          const inbox = userEntries.map((entry: any) => {
            const claimedTime = new Date(entry.claimedAt);
            const cooldownTime = new Date(
              claimedTime.getTime() + cooldownMinutes * 60000
            );
            const now = new Date();
            const status =
              now > cooldownTime
                ? "available"
                : now > claimedTime
                  ? "cooldown"
                  : "claimed";

            return {
              _id: entry._id,
              content: entry.content,
              claimedAt: entry.claimedAt,
              cooldownUntil: cooldownTime.toISOString(),
              status,
            };
          });

          setInboxItems(inbox);
        }
      } catch (error) {
        console.error("Error fetching inbox:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [token]);

  const getStatusColor = (
    status: "claimed" | "cooldown" | "available"
  ) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "cooldown":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
      case "claimed":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  const getStatusIcon = (
    status: "claimed" | "cooldown" | "available"
  ) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5" />;
      case "cooldown":
        return <Clock className="h-5 w-5" />;
      case "claimed":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getRemainingTime = (cooldownUntil: string) => {
    const now = new Date();
    const until = new Date(cooldownUntil);
    const diff = until.getTime() - now.getTime();

    if (diff <= 0) return "Ready";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const claimedCount = inboxItems.filter((i) => i.status === "claimed").length;
  const cooldownCount = inboxItems.filter(
    (i) => i.status === "cooldown"
  ).length;
  const availableCount = inboxItems.filter(
    (i) => i.status === "available"
  ).length;

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Numbers Inbox
              </h1>
            </div>
            <p className="text-muted-foreground">
              Claim your allocated numbers with cooldown timer and status
              indicators
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">
                Total Claimed
              </div>
              <div className="text-3xl font-bold text-foreground">
                {inboxItems.length}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">
                Just Claimed
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {claimedCount}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">
                In Cooldown
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {cooldownCount}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">
                Ready to Claim
              </div>
              <div className="text-3xl font-bold text-green-600">
                {availableCount}
              </div>
            </Card>
          </div>

          {/* Content */}
          {loading ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                Loading inbox...
              </div>
            </Card>
          ) : inboxItems.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No numbers in your inbox yet
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {inboxItems.map((item) => (
                <Card
                  key={item._id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`rounded-full p-2 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-lg">
                          {item.content}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Claimed at: {formatDate(item.claimedAt)}
                        </p>
                        {item.status === "cooldown" && (
                          <p className="text-sm font-semibold text-yellow-600 mt-1">
                            Cooldown: {getRemainingTime(item.cooldownUntil || "")}
                          </p>
                        )}
                        {item.status === "available" && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            Ready to claim another
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(item.status)}`}
                      >
                        {item.status === "cooldown"
                          ? `${item.status} - ${getRemainingTime(item.cooldownUntil || "")}`
                          : item.status === "available"
                            ? "Available"
                            : "Claimed"}
                      </span>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={item.status === "cooldown"}
                      >
                        {item.status === "cooldown" ? "On Cooldown" : "Claim"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
