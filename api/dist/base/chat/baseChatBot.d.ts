/// <reference types="node" resolution-mode="require"/>
import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
import { PolicySynthAgentBase } from "@policysynth/agents";
export declare class PsBaseChatBot {
    clientId: string;
    clientSocket: WebSocket;
    openaiClient: OpenAI;
    memory: IEngineInnovationMemoryData;
    currentAgent: PolicySynthAgentBase | undefined;
    broadcastingLiveCosts: boolean;
    liveCostsBroadcastTimeout: NodeJS.Timeout | undefined;
    liveCostsBroadcastInterval: number;
    liveCostsInactivityTimeout: number;
    liveCostsBoadcastStartAt: Date | undefined;
    lastSentToUserAt: Date | undefined;
    constructor(clientId: string, wsClients: Map<string, WebSocket>);
    renderSystemPrompt(): string;
    sendToClient(sender: string, message: string, type?: string): void;
    sendAgentStart(name: string, hasNoStreaming?: boolean): void;
    sendAgentCompleted(name: string, lastAgent?: boolean, error?: string | undefined): void;
    sendAgentUpdate(message: string): void;
    startBroadcastingLiveCosts(): void;
    broadCastLiveCosts(): void;
    stopBroadcastingLiveCosts(): void;
    getEmptyMemory(): IEngineInnovationMemoryData;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): Promise<void>;
    conversation: (chatLog: PsSimpleChatLog[]) => Promise<void>;
}
//# sourceMappingURL=baseChatBot.d.ts.map