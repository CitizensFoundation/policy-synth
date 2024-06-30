import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
export declare class PsBaseDiscordAgent extends PsBaseNotificationsConnector {
    private static readonly DISCORD_CONNECTOR_CLASS_BASE_ID;
    private static readonly DISCORD_CONNECTOR_VERSION;
    static getConnectorClass: PsConnectorClassCreationAttributes;
    private client;
    private token;
    channelName: string;
    systemPrompt: string;
    private actions;
    private channelTimeouts;
    private readonly maxMessages;
    private readonly listenDuration;
    constructor(connector: PsAgentConnector, connectorClass: PsAgentConnectorClass, agent: PsAgent, memory: PsAgentMemoryData | undefined, systemPrompt: string, actions: {
        [key: string]: () => Promise<void>;
    }, startProgress?: number, endProgress?: number);
    login(): Promise<void>;
    replaceInResponseArray(response: string): Promise<{
        modifiedResponse: string;
        actionsTriggered: string[];
    }>;
    respondToUser(channelId: string, conversation: DiscordConversation): Promise<void>;
    sendMessage(channelId: string, message: string): Promise<void>;
    private handleMessage;
    private setChannelTimeout;
    private archiveConversation;
    getMessages(channelId: string): Promise<string[]>;
    sendNotification(channelId: string, message: string): Promise<void>;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=discordConnector.d.ts.map