import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class PsAgentFactoryWebContentRanker extends BasePairwiseRankingsProcessor {
    instructions: string | undefined;
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankWebContent(queriesToRank: string[], instructions: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=webPageContentRanker.d.ts.map