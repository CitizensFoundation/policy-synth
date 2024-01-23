import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
export declare class PsBaseChatBot {
    clientId: string;
    clientSocket: WebSocket;
    openaiClient: OpenAI;
    constructor(clientId: string, wsClients: Map<string, WebSocket>);
    renderSystemPrompt(): string;
    sendToClient(sender: string, message: string, type?: string): void;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): Promise<void>;
    conversation: (chatLog: PsSimpleChatLog[]) => Promise<void>;
}
//# sourceMappingURL=baseChatBot.d.ts.map