import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
export declare class RebootingDemocracyChatBot extends PsBaseChatBot {
    persistMemory: boolean;
    mainSreamingSystemPrompt: string;
    mainStreamingUserPrompt: (latestQuestion: string, context: string) => string;
    sendSourceDocuments(document: PsSimpleDocumentSource[]): void;
    rebootingDemocracyConversation(chatLog: PsSimpleChatLog[], dataLayout: PsIngestionDataLayout): Promise<void>;
    updateUrls(searchContext: []): Promise<[]>;
}
//# sourceMappingURL=chatBot.d.ts.map