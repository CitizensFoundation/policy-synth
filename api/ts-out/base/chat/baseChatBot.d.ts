import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
import { GoogleGenerativeAI } from "@google/generative-ai";
export declare class PsBaseChatBot {
    wsClientId: string;
    wsClientSocket: WebSocket;
    llmProvider: "openai" | "gemini";
    openaiClient?: OpenAI;
    geminiClient?: GoogleGenerativeAI;
    geminiModel?: any;
    memory: PsChatBotMemoryData;
    static redisMemoryKeyPrefix: string;
    tempeture: number;
    maxTokens: number;
    llmModel: string;
    persistMemory: boolean;
    memoryId: string | undefined;
    lastSentToUserAt: Date | undefined;
    get redisKey(): string;
    static loadMemoryFromRedis(memoryId: string): Promise<PsChatBotMemoryData | undefined>;
    loadMemory(): Promise<PsChatBotMemoryData>;
    /**
     * @param llmProvider Choose "openai" (default) or "gemini"
     */
    constructor(wsClientId: string, wsClients: Map<string, WebSocket>, memoryId?: string | undefined, llmProvider?: "openai" | "gemini", llmModel?: string);
    setupMemory(memoryId?: string | undefined): Promise<void>;
    getLoadedMemory(): Promise<PsChatBotMemoryData>;
    sendMemoryId(): void;
    saveMemory(): Promise<void>;
    renderSystemPrompt(): string;
    sendAgentStart(name: string, hasNoStreaming?: boolean): void;
    sendAgentCompleted(name: string, lastAgent?: boolean, error?: string | undefined): void;
    sendAgentUpdate(message: string): void;
    get emptyChatBotStagesData(): {};
    getEmptyMemory(): PsChatBotMemoryData;
    sendToClient(sender: string, message: string, type?: string): void;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): Promise<void>;
    saveMemoryIfNeeded(): Promise<void>;
    setChatLog(chatLog: PsSimpleChatLog[]): Promise<void>;
    conversation: (chatLog: PsSimpleChatLog[]) => Promise<void>;
}
interface PsChatBotMemoryData {
    redisKey: string;
    chatLog?: PsSimpleChatLog[];
}
interface PsSimpleChatLog {
    sender: string;
    message: string;
}
export {};
//# sourceMappingURL=baseChatBot.d.ts.map