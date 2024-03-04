import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class IngestionChunkRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    documentSummary: string | undefined;
    constructor(memory: PsBaseMemoryData, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankDocumentChunks(chunksToRank: PsIngestionChunkData[], rankingRules: string, documentSummary: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=chunkRanker.d.ts.map