import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
export declare class EcasYeaChatBot extends PsBaseChatBot {
    persistMemory: boolean;
    mainSreamingSystemPrompt: string;
    mainStreamingUserPrompt: (latestQuestion: string, context: string) => string;
    sendSourceDocuments(document: PsSimpleDocumentSource[]): void;
    ecasYeaConversation(chatLog: PsSimpleChatLog[]): Promise<void>;
}
//# sourceMappingURL=chatBot.d.ts.map