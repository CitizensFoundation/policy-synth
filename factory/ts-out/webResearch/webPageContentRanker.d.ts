import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class PsEngineerWebContentRanker extends BasePairwiseRankingsProcessor {
    instructions: string | undefined;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankWebContent(queriesToRank: string[], instructions: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=webPageContentRanker.d.ts.map