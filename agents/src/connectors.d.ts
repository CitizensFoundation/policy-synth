interface DiscordChannelMessage {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

interface DiscordConversation {
  id: string;
  timeStartedAt: Date;
  messages: DiscordChannelMessage[];
  private: boolean;
}

interface PsConnectorsConfig {
  discord?: {
    liveDiscordChannelConversations: Record<id, DiscordConversation>;
    archivedDiscordChannelConversations: Record<id, DiscordConversation>;
  };
}