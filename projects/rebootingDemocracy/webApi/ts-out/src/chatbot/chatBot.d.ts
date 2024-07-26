import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
export declare class RebootingDemocracyChatBot extends PsBaseChatBot {
    persistMemory: boolean;
    mainSreamingSystemPrompt: string;
    mainStreamingUserPrompt: (latestQuestion: string, context: string) => string;
    rebootingDemocracyConversation: (chatLog: PsSimpleChatLog[], dataLayout: PsIngestionDataLayout) => Promise<void>;
}
//# sourceMappingURL=chatBot.d.ts.map