import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import type { ChatMessage } from "@shared/api";

interface ChatAreaProps {
  selectedChat: {
    type: "group" | "direct";
    id: string;
    name: string;
  };
  token: string | null;
}

interface TypingIndicator {
  userId: string;
  senderName: string;
  chatId: string;
  chatType: "group" | "direct";
  timestamp: number;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function ChatArea({ selectedChat, token }: ChatAreaProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (selectedChat.type === "group") {
          params.append("groupId", selectedChat.id);
        } else {
          params.append("recipient", selectedChat.id);
        }

        const response = await fetch(
          `/api/chat/messages?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.filter((msg: ChatMessage) => !msg.deleted));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 1 second for near real-time feel
    const interval = setInterval(fetchMessages, 1000);

    return () => clearInterval(interval);
  }, [selectedChat, token]);

  // Fetch typing indicators
  useEffect(() => {
    const fetchTyping = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `/api/chat/typing?chatId=${selectedChat.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setTypingUsers(data.filter((t: TypingIndicator) => t.userId !== user?._id));
        }
      } catch (error) {
        console.error("Error fetching typing status:", error);
      }
    };

    const interval = setInterval(fetchTyping, 500);

    return () => clearInterval(interval);
  }, [selectedChat, token, user?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleTyping = () => {
    if (!token || !isTyping) {
      // Send typing indicator
      fetch("/api/chat/typing", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          chatType: selectedChat.type,
          isTyping: true,
        }),
      }).catch(console.error);

      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          chatType: selectedChat.type,
          isTyping: false,
        }),
      }).catch(console.error);

      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !token) return;

    try {
      setSending(true);
      const payload: any = {
        content: newMessage,
      };

      if (selectedChat.type === "group") {
        payload.groupId = selectedChat.id;
      } else {
        payload.recipient = selectedChat.id;
      }

      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");

        // Clear typing indicator
        fetch("/api/chat/typing", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: selectedChat.id,
            chatType: selectedChat.type,
            isTyping: false,
          }),
        }).catch(console.error);

        setIsTyping(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || !token) return;

    try {
      const response = await fetch("/api/chat/edit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          content: editContent,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setMessages(
          messages.map((msg) => (msg._id === messageId ? updated : msg)),
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!token) return;

    try {
      const response = await fetch("/api/chat/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg._id !== messageId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    if (!token) return;

    try {
      await fetch("/api/chat/mark-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg">{selectedChat.name}</h3>
        {selectedChat.type === "group" && (
          <p className="text-xs text-muted-foreground">Group Chat</p>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && typingUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex gap-3 group ${
                    message.sender === user?._id ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderPicture} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col gap-1 max-w-xs ${
                      message.sender === user?._id ? "items-end" : ""
                    }`}
                  >
                    <div className="flex gap-2 items-center">
                      {editingId === message._id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="h-8 text-sm max-w-xs"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditMessage(message._id)}
                            className="h-8 px-2"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              message.sender === user?._id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            {message.editedAt && (
                              <p className="text-xs opacity-70 mt-1">
                                (edited)
                              </p>
                            )}
                          </div>

                          {message.sender === user?._id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={message.sender === user?._id ? "end" : "start"}>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingId(message._id);
                                    setEditContent(message.content);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteMessage(message._id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {message.senderName}
                      </span>
                      {message.sender === user?._id && (
                        <span className="text-xs text-muted-foreground">
                          {message.readBy && message.readBy.length > 0 ? (
                            <CheckCheck className="h-3 w-3 inline" />
                          ) : (
                            <Check className="h-3 w-3 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex gap-3 items-center text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 150}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <span>
                    {typingUsers.map((t) => t.senderName).join(", ")}
                    {typingUsers.length === 1 ? " is" : " are"} typing...
                  </span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
