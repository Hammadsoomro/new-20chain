import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Clock,
  Users,
  List,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import type { User } from "@shared/api";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { io, Socket } from "socket.io-client";

export default function Dashboard() {
  const { user, isAdmin, token } = useAuth();
  const [stats, setStats] = useState([
    {
      label: "Team Members",
      value: "0",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Lines Queued",
      value: "0",
      icon: List,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Claimed Today",
      value: "0",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Claim Cooldown",
      value: "5m",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  // Fetch real-time stats and team members with WebSocket support
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        // Fetch team members
        const response = await fetch("/api/members", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const members = await response.json();
          setTeamMembers(members);

          // Update team members count in stats
          setStats((prev) =>
            prev.map((stat) =>
              stat.label === "Team Members"
                ? { ...stat, value: members.length.toString() }
                : stat,
            ),
          );
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up WebSocket connection for real-time updates
    if (!socketRef.current && token) {
      socketRef.current = io(window.location.origin, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Listen for member updates
      socketRef.current.on("member-added", (newMember: User) => {
        console.log("[Dashboard] New member added:", newMember.name);
        setTeamMembers((prev) => [...prev, newMember]);
      });

      socketRef.current.on("member-updated", (updatedMember: User) => {
        console.log("[Dashboard] Member updated:", updatedMember.name);
        setTeamMembers((prev) =>
          prev.map((m) => (m._id === updatedMember._id ? updatedMember : m)),
        );
      });

      socketRef.current.on("member-removed", (memberId: string) => {
        console.log("[Dashboard] Member removed:", memberId);
        setTeamMembers((prev) => prev.filter((m) => m._id !== memberId));
      });
    }

    // Set up polling for fallback real-time updates (every 30 seconds)
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.off("member-added");
        socketRef.current.off("member-updated");
        socketRef.current.off("member-removed");
      }
    };
  }, [token]);

  const quickLinks = isAdmin
    ? [
        {
          title: "Numbers Sorter",
          description: "Add and deduplicate numbers",
          icon: BarChart3,
          path: "/sorter",
        },
        {
          title: "Queued List",
          description: "Manage queued numbers",
          icon: List,
          path: "/queued",
        },
        {
          title: "Team Management",
          description: "Manage team members",
          icon: Users,
          path: "/settings",
        },
      ]
    : [
        {
          title: "Numbers Inbox",
          description: "Claim your numbers",
          icon: Clock,
          path: "/inbox",
        },
        {
          title: "Team Chat",
          description: "Connect with your team",
          icon: Users,
          path: "/chat",
        },
        {
          title: "History",
          description: "View your claimed numbers",
          icon: TrendingUp,
          path: "/history",
        },
      ];

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage your team and track your numbers"
                : "Check your inbox and collaborate with your team"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="border-border/50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </span>
                        <div className={`${stat.bgColor} p-2 rounded-lg`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Team Members Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Team Members
            </h2>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading team members...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No team members yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member._id}
                    member={member}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
