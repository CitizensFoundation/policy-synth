import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
export declare class LiveResearchChatBot extends PsBaseChatBot {
    numberOfQueriesToGenerate: number;
    percentOfQueriesToSearch: number;
    percentOfResultsToScan: number;
    summarySystemPrompt: string;
    jsonWebPageResearchSchema: string;
    renderFollowupSystemPrompt(): string;
    doLiveResearch(question: string): any;
    renderResultsToUser(research: object[], question: string): any;
    researchConversation: (chatLog: PsSimpleChatLog[], numberOfSelectQueries: number, percentOfTopQueriesToSearch: number, percentOfTopResultsToScan: number) => any;
}
//# sourceMappingURL=liveResearchChatBot.d.ts.map