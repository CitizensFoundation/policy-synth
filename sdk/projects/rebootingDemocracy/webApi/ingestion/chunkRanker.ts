import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
import { IEngineConstants } from "./constants.js";

export class IngestionChunkRanker extends BasePairwiseRankingsProcessor {
  rankingRules: string | undefined;
  documentSummary: string | undefined;

  constructor(
    memory: PsBaseMemoryData,
    progressFunction: Function | undefined = undefined
  ) {
    super(undefined as any, memory);
    this.progressFunction = progressFunction;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<IEnginePairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as PsIngestionChunkData;
    const itemTwo = this.allItems![index]![itemTwoIndex] as PsIngestionChunkData;

    const messages = [
      new SystemMessage(
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
      new HumanMessage(
        `
        User Ranking Rules:
        ${this.rankingRules}

        Full document summary:
        ${this.documentSummary}

        Document Chunks to Rank:

        Document Chunk One:
        ${itemOne.compressedContents}

        Document Chunk Two:
        ${itemTwo.compressedContents}

        The Most Relevant Document Chunk Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankDocumentChunks(
    chunksToRank: PsIngestionChunkData[],
    rankingRules: string,
    documentSummary: string
  ) {
    this.rankingRules = rankingRules;
    this.documentSummary = documentSummary;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.searchQueryRankingsModel.temperature,
      maxTokens: IEngineConstants.searchQueryRankingsModel.maxOutputTokens,
      modelName: IEngineConstants.searchQueryRankingsModel.name,
      verbose: IEngineConstants.searchQueryRankingsModel.verbose,
    });

    this.setupRankingPrompts(
      -1,
      chunksToRank as PsEloRateable[],
      chunksToRank.length * 10,
      this.progressFunction,
    );
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1, true) as PsIngestionChunkData[];
  }
}
