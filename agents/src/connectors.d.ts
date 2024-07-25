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
    liveDiscordChannelConversations: Record<any, DiscordConversation>;
    archivedDiscordChannelConversations: Record<any, DiscordConversation>;
  };
}