import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { Layout } from "@/components/Layout";
import { ChatContactList } from "@/components/chat/ChatContactList";
import { ChatArea } from "@/components/chat/ChatArea";
import type { User, ChatGroup } from "@shared/api";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface ChatConversation {
  type: "group" | "direct";
  id: string;
  name: string;
  unreadCount: number;
  lastMessageTime?: string;
  member?: User;
  group?: ChatGroup;
}

export default function TeamChat() {
  const { user, token } = useAuth();
  const { setUnreadCount } = useChat();
  const location = useLocation();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{
    type: "group" | "direct";
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) {
          console.warn("[TeamChat] API health check failed:", res.status);
          setError(
            "Backend service is temporarily unavailable. Please refresh the page.",
          );
        }
      } catch (err) {
        console.warn("[TeamChat] API health check error:", err);
        setError("Cannot connect to backend. Please check your connection.");
      }
    };

    checkHealth();
  }, []);

  // Initialize socket connection and listen for messages
  useEffect(() => {
    if (!token || !user?._id) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[TeamChat] Notification permission:", permission);
      });
    }

    // Disconnect existing socket if any
    if (socketRef.current && socketRef.current.connected) {
      console.log("[TeamChat] Disconnecting previous socket");
      socketRef.current.disconnect();
    }

    // Create shared socket instance with optimized configuration
    const socket = io(window.location.origin, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"],
      forceNew: false,
    });

    socketRef.current = socket;

    // Handle socket connection errors
    const handleConnectionError = (error: any) => {
      console.error("[TeamChat] Socket connection error:", error);
    };

    const handleDisconnect = (reason: string) => {
      console.warn("[TeamChat] Socket disconnected:", reason);
    };

    socket.on("connect_error", handleConnectionError);
    socket.on("disconnect", handleDisconnect);

    // Handler for new messages
    const handleNewMessage = (data: any) => {
      console.log("[TeamChat] Received message:", data);

      const isUserOnChatPage = location.pathname === "/chat";

      setConversations((prev) => {
        const updated = [...prev];
        const convIndex = updated.findIndex((c) => c.id === data.chatId);

        if (convIndex !== -1) {
          const conversation = updated[convIndex];
          const isFromCurrentUser = data.sender === user._id;

          // Update last message time for all messages
          conversation.lastMessageTime = data.timestamp;

          // Only increment unread if this message is not from current user
          if (!isFromCurrentUser) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            console.log(
              `[TeamChat] Unread count updated for ${conversation.name}: ${conversation.unreadCount}`,
            );

            // Update global unread count
            setUnreadCount(data.chatId, conversation.unreadCount);

            // Show toast notification ONLY if user is NOT on the chat page
            if (!isUserOnChatPage) {
              toast.success(`💬 New message from ${data.senderName}`, {
                description: data.content.substring(0, 100),
                duration: 4000,
              });

              // Play notification sound when showing notification
              playNotificationSound();

              // Show desktop notification
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification(`New message from ${data.senderName}`, {
                  body: data.content.substring(0, 100),
                  icon: "/favicon.ico",
                  tag: "message-notification",
                  requireInteraction: false,
                });
              }
            }
          }

          // Move conversation to top
          const [moved] = updated.splice(convIndex, 1);
          updated.unshift(moved);
        }

        return updated;
      });
    };

    const handleConnect = () => {
      console.log("[TeamChat] Socket connected:", socket.id);
      // Re-join all active chat rooms after reconnection
      setConversations((prev) => {
        prev.forEach((conv) => {
          socket.emit("join-chat", {
            chatId: conv.id,
            userId: user._id,
          });
        });
        return prev;
      });
    };

    const handleConnectError = (error: any) => {
      console.error("[TeamChat] Socket connection error:", error);
    };

    const handleReconnectAttempt = () => {
      console.log("[TeamChat] Attempting to reconnect...");
    };

    // Add event listeners
    socket.on("new-message", handleNewMessage);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect_attempt", handleReconnectAttempt);

    return () => {
      // Properly remove listeners before disconnecting
      socket.off("new-message", handleNewMessage);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.disconnect();
    };
  }, [token, user?._id, location.pathname, setUnreadCount]);

  // Join all chat rooms when conversations load
  useEffect(() => {
    if (!socketRef.current || conversations.length === 0 || !user?._id) return;

    console.log(`[TeamChat] Joining ${conversations.length} chat rooms`);
    conversations.forEach((conv) => {
      socketRef.current?.emit("join-chat", {
        chatId: conv.id,
        userId: user._id,
      });
      console.log(`[TeamChat] Joined chat room: ${conv.id}`);
    });
  }, [conversations, user?._id]);

  // Fetch initial team members and group chat
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const convs: ChatConversation[] = [];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          // Fetch group chat
          try {
            const groupRes = await fetch("/api/chat/group", {
              headers,
              signal: controller.signal,
            });
            if (!groupRes.ok) {
              console.warn(
                `[TeamChat] Group chat request failed: ${groupRes.status}`,
              );
            } else {
              const group = await groupRes.json();
              convs.push({
                type: "group",
                id: group._id,
                name: group.name,
                unreadCount: 0,
                group,
              });
            }
          } catch (error) {
            console.error("[TeamChat] Error fetching group chat:", error);
          }

          // Fetch team members
          try {
            const membersRes = await fetch("/api/members", {
              headers,
              signal: controller.signal,
            });
            if (!membersRes.ok) {
              console.warn(
                `[TeamChat] Members request failed: ${membersRes.status}`,
              );
            } else {
              const members = await membersRes.json();
              members.forEach((member: User) => {
                if (member._id !== user?._id) {
                  convs.push({
                    type: "direct",
                    id: member._id,
                    name: member.name,
                    unreadCount: 0,
                    member,
                  });
                }
              });
            }
          } catch (error) {
            console.error("[TeamChat] Error fetching members:", error);
          }
        } finally {
          clearTimeout(timeout);
        }

        // Auto-select group chat if available
        if (convs.length > 0) {
          setSelectedChat({
            type: convs[0].type,
            id: convs[0].id,
            name: convs[0].name,
          });
        }

        setConversations(convs);
      } catch (error) {
        console.error("[TeamChat] Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?._id]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      // Modern notification sound: ascending musical chime
      const notes = [523, 659, 784]; // C5, E5, G5 (pleasant chord)
      const noteDuration = 0.12; // 120ms per note
      const gapDuration = 0.04; // 40ms gap between notes

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(gainNode);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        const startTime =
          audioContext.currentTime + index * (noteDuration + gapDuration);

        // Smooth envelope with natural fade in/out
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
        gainNode.gain.setValueAtTime(0.35, startTime + noteDuration - 0.03);
        gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      });

      console.log("[TeamChat] Modern notification sound played");
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const handleSelectChat = (conversation: ChatConversation) => {
    console.log("[TeamChat] Selected chat:", conversation.id);

    setSelectedChat({
      type: conversation.type,
      id: conversation.id,
      name: conversation.name,
    });

    // Mark as read - reset unread count
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv,
      ),
    );
  };

  return (
    <Layout>
      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Connection Error</div>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      {loading && !error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chat...</div>
        </div>
      )}
      {!loading && !error && (
        <div className="flex h-full gap-4 p-6">
          {/* Contact List */}
          <div className="w-80 border-r border-border">
            <ChatContactList
              conversations={conversations}
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <ChatArea
                selectedChat={selectedChat}
                token={token}
                socket={socketRef.current}
              />
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
