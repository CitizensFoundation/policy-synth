import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
export declare class PsBaseChatBot {
    wsClientId: string;
    wsClientSocket: WebSocket;
    openaiClient: OpenAI;
    memory: PsChatBotMemoryData;
    broadcastingLiveCosts: boolean;
    liveCostsBroadcastInterval: number;
    liveCostsInactivityTimeout: number;
    static redisMemoryKeyPrefix: string;
    tempeture: number;
    maxTokens: number;
    llmModel: string;
    persistMemory: boolean;
    memoryId: string | undefined;
    liveCostsBroadcastTimeout: NodeJS.Timeout | undefined;
    liveCostsBoadcastStartAt: Date | undefined;
    lastSentToUserAt: Date | undefined;
    lastBroacastedCosts: number | undefined;
    get redisKey(): string;
    static loadMemoryFromRedis(memoryId: string): Promise<PsChatBotMemoryData | undefined>;
    static getFullCostOfMemory(memory: PsChatBotMemoryData): number | undefined;
    loadMemory(): Promise<PsChatBotMemoryData>;
    constructor(wsClientId: string, wsClients: Map<string, WebSocket>, memoryId?: string | undefined);
    setupMemory(memoryId?: string | undefined): Promise<void>;
    get fullLLMCostsForMemory(): number | undefined;
    getLoadedMemory(): Promise<PsChatBotMemoryData>;
    sendMemoryId(): void;
    saveMemory(): Promise<void>;
    renderSystemPrompt(): string;
    sendAgentStart(name: string, hasNoStreaming?: boolean): void;
    sendAgentCompleted(name: string, lastAgent?: boolean, error?: string | undefined): void;
    sendAgentUpdate(message: string): void;
    startBroadcastingLiveCosts(): void;
    broadCastLiveCosts(): void;
    stopBroadcastingLiveCosts(): void;
    get emptyChatBotStagesData(): Record<PSChatBotMemoryStageTypes, any>;
    getEmptyMemory(): PsChatBotMemoryData;
    sendToClient(sender: string, message: string, type?: string): void;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): Promise<void>;
    getTokenCosts(estimateTokens: number, type: "in" | "out"): number;
    addToExternalSolutionsMemoryCosts(text: string, type: "in" | "out"): void;
    saveMemoryIfNeeded(): Promise<void>;
    setChatLog(chatLog: PsSimpleChatLog[]): Promise<void>;
    conversation: (chatLog: PsSimpleChatLog[]) => Promise<void>;
}
//# sourceMappingURL=baseChatBot.d.ts.map