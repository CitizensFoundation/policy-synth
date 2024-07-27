import { Client, Message } from "discord.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
export declare class PsBaseDiscordConnector extends PsBaseNotificationsConnector {
    static readonly DISCORD_CONNECTOR_CLASS_BASE_ID = "8f7e6d5c-4b3a-2a1f-9e8d-7c6b5a4d3f2e";
    static readonly DISCORD_CONNECTOR_VERSION = 2;
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    client: Client;
    token: string;
    channelName: string;
    systemPrompt: string;
    actions: {
        [key: string]: () => Promise<void>;
    };
    channelTimeouts: {
        [id: string]: NodeJS.Timeout;
    };
    readonly maxMessages: number;
    readonly listenDuration: number;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: PsAgentMemoryData | undefined, systemPrompt: string, actions: {
        [key: string]: () => Promise<void>;
    }, startProgress?: number, endProgress?: number);
    login(): Promise<void>;
    replaceInResponseArray(response: string): Promise<{
        modifiedResponse: string;
        actionsTriggered: string[];
    }>;
    respondToUser(channelId: string, conversation: DiscordConversation): Promise<void>;
    sendMessage(channelId: string, message: string): Promise<void>;
    handleMessage(message: Message): Promise<void>;
    setChannelTimeout(channelId: string): void;
    archiveConversation(channelId: string): void;
    getMessages(channelId: string): Promise<string[]>;
    sendNotification(channelId: string, message: string): Promise<void>;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=discordConnector.d.ts.map