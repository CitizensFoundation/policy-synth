import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
export declare class RebootingDemocracyChatBot extends PsBaseChatBot {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    persistMemory: boolean;
    summarySystemPrompt: string;
    jsonWebPageResearchSchema: string;
    renderFollowupSystemPrompt(): string;
    doLiveResearch(question: string): Promise<void>;
    renderResultsToUser(research: object[], question: string): Promise<void>;
    researchConversation: (chatLog: PsSimpleChatLog[], numberOfSelectQueries: number, percentOfTopQueriesToSearch: number, percentOfTopResultsToScan: number) => Promise<void>;
}
//# sourceMappingURL=chatBot.d.ts.map