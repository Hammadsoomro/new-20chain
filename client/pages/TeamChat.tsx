import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { ChatContactList } from "@/components/chat/ChatContactList";
import { ChatArea } from "@/components/chat/ChatArea";
import type { User, ChatGroup } from "@shared/api";

export default function TeamChat() {
  const { user, token } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [groupChat, setGroupChat] = useState<ChatGroup | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    type: "group" | "direct";
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch team members and group chat
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [membersRes, groupRes] = await Promise.all([
          fetch("/api/members", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/chat/group", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (membersRes.ok) {
          const members = await membersRes.json();
          setTeamMembers(members);
        }

        if (groupRes.ok) {
          const group = await groupRes.json();
          setGroupChat(group);
          setSelectedChat({
            type: "group",
            id: group._id,
            name: group.name,
          });
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSelectMember = (member: User) => {
    if (member._id === user?._id) return;

    setSelectedChat({
      type: "direct",
      id: member._id,
      name: member.name,
    });
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chat...</div>
        </div>
      ) : (
        <div className="flex h-full gap-4 p-6">
          {/* Contact List */}
          <div className="w-80 border-r border-border">
            <ChatContactList
              members={teamMembers}
              groupChat={groupChat}
              selectedChat={selectedChat}
              onSelectMember={handleSelectMember}
              onSelectGroup={() => {
                if (groupChat) {
                  setSelectedChat({
                    type: "group",
                    id: groupChat._id,
                    name: groupChat.name,
                  });
                }
              }}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <ChatArea selectedChat={selectedChat} token={token} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
