import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class IngestionChunkRanker extends BasePairwiseRankingsProcessor {
    rankingRules: string | undefined;
    documentSummary: string | undefined;
    constructor(memory?: PsBaseMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankDocumentChunks(chunksToRank: PsRagChunk[], rankingRules: string, documentSummary: string, eloRatingKey: string): Promise<PsRagChunk[]>;
}
//# sourceMappingURL=chunkRanker.d.ts.map