import { SimplePairwiseRankingsAgent } from "../../base/simplePairwiseRanking.js";

export class IngestionChunkRanker extends SimplePairwiseRankingsAgent {
  rankingRules: string | undefined;
  documentSummary: string | undefined;
  maxModelTokensOut = 3;
  modelTemperature = 0.0;

  constructor(
    memory: PsSimpleAgentMemoryData | undefined = undefined,
    progressFunction: Function | undefined = undefined
  ) {
    super(memory!);
    this.progressFunction = progressFunction;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as PsRagChunk;
    const itemTwo = this.allItems![index]![itemTwoIndex] as PsRagChunk;

    const messages = [
      this.createSystemMessage(
        `
        You are an AI expert trained to rank chunks of documents based on their relevance to the users ranking rules.

        Instructions:
        1. The user will provide you with ranking rules you should follow.
        2. You will also see document chunks, each marked as "Document Chunk One" and "Document Chunk Two".
        3. Your task is to analyze, compare, and rank these document chunks based on their relevance to the users rankinng rules.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `
        User Ranking Rules:
        ${this.rankingRules}

        Full document summary:
        ${this.documentSummary}

        Document Chunks to Rank:

        Document Chunk One:
        ${itemOne.compressedContent || itemOne.fullSummary}

        Document Chunk Two:
        ${itemTwo.compressedContent || itemOne.fullSummary}

        The Most Relevant Document Chunk Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "ingestion-agent",
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankDocumentChunks(
    chunksToRank: PsRagChunk[],
    rankingRules: string,
    documentSummary: string,
    eloRatingKey: string
  ) {
    this.rankingRules = rankingRules;
    this.documentSummary = documentSummary;

    this.maxModelTokensOut = 3;
    this.modelTemperature = 0.0;

    this.setupRankingPrompts(
      -1,
      chunksToRank as PsEloRateable[],
      chunksToRank.length * 10,
      this.progressFunction,
    );
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1, true, eloRatingKey) as PsRagChunk[];
  }
}
