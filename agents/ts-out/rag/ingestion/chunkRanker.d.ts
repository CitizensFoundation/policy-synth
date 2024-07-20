import { SimplePairwiseRankingsAgent } from "../../base/simplePairwiseRanking.js";
export declare class IngestionChunkRanker extends SimplePairwiseRankingsAgent {
    rankingRules: string | undefined;
    documentSummary: string | undefined;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(memory?: PsSimpleAgentMemoryData | undefined, progressFunction?: Function | undefined);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankDocumentChunks(chunksToRank: PsRagChunk[], rankingRules: string, documentSummary: string, eloRatingKey: string): Promise<PsRagChunk[]>;
}
//# sourceMappingURL=chunkRanker.d.ts.map