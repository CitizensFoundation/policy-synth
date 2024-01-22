import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
export declare class BaseChatBot {
    constructor(userQuestion: string, chatConversation: PsSimpleChatLog[], clientId: string, wsClients: Map<string, WebSocket>);
    renderSystemPrompt(): string;
    streamWebSocketResponses(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, clientId: string, wsClients: Map<string, WebSocket>): Promise<void>;
    conversation: (clientId: string, wsClients: Map<string, WebSocket>, chatLog: PsSimpleChatLog[]) => Promise<void>;
}
//# sourceMappingURL=baseChatBot.d.ts.map