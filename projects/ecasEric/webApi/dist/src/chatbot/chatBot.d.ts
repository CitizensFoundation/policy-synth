import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import WebSocket from "ws";
import { Content } from "@google/generative-ai";
export declare class EcasYeaChatBot extends PsBaseChatBot {
    persistMemory: boolean;
    mainStreamingSystemPrompt: (topicTitle: string, topicContext: string) => string;
    mainStreamingUserPrompt: (latestQuestion: string, questionAnswerContext: string, countryLinksInfo: string | undefined) => string;
    searchContext?: {
        question: string;
        answer: string;
    }[];
    currentTopicId: number | undefined;
    constructor(wsClientId: string, wsClients: Map<string, WebSocket>, memoryId?: string, topicId?: number);
    sendSourceDocuments(document: PsSimpleDocumentSource[]): void;
    private linkService;
    private syncChatSession;
    loadCountryLinksInfo(countrySlug: string): Promise<string | undefined>;
    loadQaPairsForTopic(topicId: number | undefined): Promise<{
        question: string;
        answer: string;
    }[]>;
    streamResponse(prompt: string | Content | (string | Content)[], chatHistory: Content[]): Promise<void>;
    ecasYeaConversation(chatLog: PsSimpleChatLog[]): Promise<void>;
}
//# sourceMappingURL=chatBot.d.ts.map