export function getChatRoomId(chatId: string, chatType: "direct" | "group"): string {
  if (chatType === "group") {
    return chatId;
  }
  
  // For direct messages, return the chatId as-is
  // The client will handle creating normalized room IDs
  return chatId;
}

export function getDirectMessageRoomId(userId1: string, userId2: string): string {
  // Create a normalized room ID so both users join the same room
  const sorted = [userId1, userId2].sort();
  return `dm-${sorted[0]}-${sorted[1]}`;
}
