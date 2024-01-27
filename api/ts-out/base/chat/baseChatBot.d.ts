/// <reference types="node" resolution-mode="require"/>
import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsBaseChatBot {
    wsClientId: string;
    wsClientSocket: WebSocket;
    openaiClient: OpenAI;
    memory: PsChatBotMemoryData;
    currentAgent: PolicySynthAgentBase | undefined;
    broadcastingLiveCosts: boolean;
    liveCostsBroadcastInterval: number;
    liveCostsInactivityTimeout: number;
    redisMemoryKeyPrefix: string;
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
    loadMemory(): Promise<PsChatBotMemoryData>;
    constructor(wsClientId: string, wsClients: Map<string, WebSocket>, memoryId?: string | undefined);
    setupMemory(memoryId?: string | undefined): Promise<void>;
    getLoadedMemory(): Promise<PsChatBotMemoryData>;
    sendMemoryId(): void;
    saveMemory(): Promise<void>;
    renderSystemPrompt(): string;
    sendToClient(sender: string, message: string, type?: string): void;
    sendAgentStart(name: string, hasNoStreaming?: boolean): void;
    sendAgentCompleted(name: string, lastAgent?: boolean, error?: string | undefined): void;
    sendAgentUpdate(message: string): void;
    startBroadcastingLiveCosts(): void;
    broadCastLiveCosts(): void;
    stopBroadcastingLiveCosts(): void;
    get emptyChatBotStagesData(): Record<PSChatBotMemoryStageTypes, IEngineInnovationStagesData>;
    getEmptyMemory(): PsChatBotMemoryData;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): Promise<void>;
    getTokenCosts(estimateTokens: number, type: "in" | "out"): number;
    addToExternalSolutionsMemoryCosts(text: string, type: "in" | "out"): void;
    setChatLog(chatLog: PsSimpleChatLog[]): Promise<void>;
    conversation: (chatLog: PsSimpleChatLog[]) => Promise<void>;
}
//# sourceMappingURL=baseChatBot.d.ts.map