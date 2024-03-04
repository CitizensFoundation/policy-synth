import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
export declare class IngestionChunkRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    documentSummary: string | undefined;
    constructor(memory?: PsBaseMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<IEnginePairWiseVoteResults>;
    rankDocumentChunks(chunksToRank: PsIngestionChunkData[], rankingRules: string, documentSummary: string): Promise<PsIngestionChunkData[]>;
}
//# sourceMappingURL=chunkRanker.d.ts.map