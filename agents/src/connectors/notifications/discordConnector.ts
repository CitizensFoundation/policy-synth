import {
  Client,
  GatewayIntentBits,
  Partials,
  Message,
  TextChannel,
  ChannelType,
} from "discord.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";

export class PsBaseDiscordConnector extends PsBaseNotificationsConnector {
  static readonly DISCORD_CONNECTOR_CLASS_BASE_ID =
    "8f7e6d5c-4b3a-2a1f-9e8d-7c6b5a4d3f2e";

  static readonly DISCORD_CONNECTOR_VERSION = 2;

  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
    class_base_id: this.DISCORD_CONNECTOR_CLASS_BASE_ID,
    name: "Discord Bot",
    version: this.DISCORD_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Discord Bot",
      classType: PsConnectorClassTypes.NotificationsAndChat,
      description: "Connector for Discord Market Research Bot",
      hasPublicAccess: true,
      imageUrl:
        "https://aoi-storage-production.citizens.is/ypGenAi/community/1/7336a9fb-7512-4c31-ae77-0bb7c5a99b97.png",
      iconName: "discord",
      questions: [
        {
          uniqueId: "name",
          text: "Name",
          type: "textField",
          maxLength: 200,
          required: true,
        },
        {
          uniqueId: "description",
          text: "Description",
          type: "textArea",
          maxLength: 500,
          required: false,
        },
        ...PsBaseDiscordConnector.getExtraConfigurationQuestions(),
      ],
    },
  };

  client: Client;
  token: string;
  channelName: string;
  systemPrompt: string;
  actions: { [key: string]: () => Promise<void> };

  channelTimeouts: { [id: string]: NodeJS.Timeout } = {};
  readonly maxMessages: number = 10;
  readonly listenDuration: number = 3600000; // 1 hour in milliseconds

  constructor(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    systemPrompt: string,
    actions: { [key: string]: () => Promise<void> },
    startProgress: number = 0,
    endProgress: number = 100
  ) {
    super(connector, connectorClass, agent, memory, startProgress, endProgress);

    this.systemPrompt = systemPrompt;
    this.actions = actions;

    this.token = this.getConfig("discordBotToken", "");
    this.channelName = this.getConfig("channelName", "some-channel");

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],
    });

    if (!this.memory.connectors) {
      this.memory.connectors = {
        discord: {
          liveDiscordChannelConversations: {},
          archivedDiscordChannelConversations: {},
        },
      };
    }

    if (!this.memory.connectors!.discord!.liveDiscordChannelConversations) {
      this.memory.connectors!.discord!.liveDiscordChannelConversations = {};
    }

    if (!this.memory.connectors!.discord!.archivedDiscordChannelConversations) {
      this.memory.connectors!.discord!.archivedDiscordChannelConversations = {};
    }
  }

  async login(): Promise<void> {
    if (!this.token) {
      throw new Error("Discord bot token is not set.");
    }

    try {
      await this.client.login(this.token);
      console.log("Discord bot logged in!");

      this.client.once("ready", () => {
        console.log(`Logged in as ${this.client.user?.tag}!`);
      });

      this.client.on("messageCreate", (message) => {
        const isDM = message.channel.type === ChannelType.DM;
        const isMentioned = message.mentions.has(this.client.user!.id);

        if (isDM || isMentioned) {
          console.log(
            `Received message: ${message.content} from ${message.author.tag}`
          );
          this.handleMessage(message);
        }
      });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async replaceInResponseArray(
    response: string
  ): Promise<{ modifiedResponse: string; actionsTriggered: string[] }> {
    const actionsTriggered: string[] = [];
    let modifiedResponse = response;

    for (const action in this.actions) {
      if (response.includes(action)) {
        console.log(`Triggering action: ${action}`);
        actionsTriggered.push(action);
        await this.actions[action]();
        modifiedResponse = modifiedResponse.replace(action, "");
      }
    }

    return { modifiedResponse, actionsTriggered };
  }

  async respondToUser(
    channelId: string,
    conversation: DiscordConversation
  ): Promise<void> {
    const messages = [
      { role: "system", content: this.systemPrompt },
      ...conversation.messages.map((msg) => ({
        role: msg.author === this.client.user?.tag ? "assistant" : "user",
        message: msg.content,
      })),
    ] as PsModelMessage[];

    let response = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      messages
    );

    const { modifiedResponse, actionsTriggered } =
      await this.replaceInResponseArray(response);

    await this.sendMessage(channelId, modifiedResponse);
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(
        channelId
      )) as TextChannel;
      await channel.send(message);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async handleMessage(message: Message): Promise<void> {
    const channelId = message.channel.id;
    const isDM = message.channel.type === ChannelType.DM;

    if (
      !this.memory.connectors!.discord!.liveDiscordChannelConversations[
        channelId
      ]
    ) {
      this.memory.connectors!.discord!.liveDiscordChannelConversations[
        channelId
      ] = {
        id: channelId,
        timeStartedAt: new Date(),
        messages: [],
        private: isDM,
      };

      if (!isDM) {
        this.setChannelTimeout(channelId);
      }
    }

    const conversation =
      this.memory.connectors!.discord!.liveDiscordChannelConversations[
        channelId
      ];

    conversation.messages.push({
      id: message.id,
      content: message.content,
      author: message.author.tag,
      timestamp: message.createdAt,
    });

    if (conversation.messages.length > this.maxMessages) {
      conversation.messages.shift(); // Keep only the last X messages
    }

    await this.saveMemory();

    if (message.author.bot) return;

    await this.respondToUser(channelId, conversation);

    await this.saveMemory();
  }

  setChannelTimeout(channelId: string): void {
    if (this.channelTimeouts[channelId]) {
      clearTimeout(this.channelTimeouts[channelId]);
    }

    this.channelTimeouts[channelId] = setTimeout(() => {
      this.archiveConversation(channelId);
      console.log(
        `Stopped listening to channel: ${channelId} due to inactivity.`
      );
    }, this.listenDuration);
  }

  archiveConversation(channelId: string): void {
    const conversation =
      this.memory.connectors!.discord!.liveDiscordChannelConversations[
        channelId
      ];
    if (conversation) {
      if (
        !this.memory.connectors!.discord!.archivedDiscordChannelConversations[
          channelId
        ]
      ) {
        this.memory.connectors!.discord!.archivedDiscordChannelConversations[
          channelId
        ] = {
          id: channelId,
          timeStartedAt: conversation.timeStartedAt,
          messages: [],
          private: conversation.private,
        };
      }

      this.memory.connectors!.discord!.archivedDiscordChannelConversations[
        channelId
      ].messages.push(...conversation.messages);

      delete this.memory.connectors!.discord!.liveDiscordChannelConversations[
        channelId
      ];
      this.saveMemory();
    }
  }

  async getMessages(channelId: string): Promise<string[]> {
    try {
      const messages = (await this.client.channels.fetch(
        channelId
      )) as TextChannel;
      const fetchedMessages = await messages.messages.fetch({ limit: 100 });
      return fetchedMessages.map((msg) => msg.content);
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async sendNotification(channelId: string, message: string): Promise<void> {
    try {
      const targetChannel = (await this.client.channels.fetch(
        channelId
      )) as TextChannel;
      await targetChannel.send(message);
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "discordBotToken",
        text: "Bot Token",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "competitorChannelName",
        text: "Competitor Channel Name",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "customerChannelName",
        text: "Customer Channel Name",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "productIdeasChannelName",
        text: "Product Ideas Channel Name",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "useCaseChannelName",
        text: "Use Case Channel Name",
        type: "textField",
        maxLength: 200,
        required: true,
      },
    ];
  }
}
