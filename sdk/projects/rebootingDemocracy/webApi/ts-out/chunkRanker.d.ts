import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class IngestionChunkRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankDocumentChunks(chunksToRank: string[], rankingRules: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=chunkRanker.d.ts.map