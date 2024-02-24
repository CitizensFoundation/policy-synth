import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "../../constants.js";
import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";

export class RankRootCausesSearchQueriesProcessor extends BasePairwiseRankingsProcessor {
  rootCauseTypes = [
    "historicalRootCause",
    "economicRootCause",
    "scientificRootCause",
    "culturalRootCause",
    "socialRootCause",
    "environmentalRootCause",
    "legalRootCause",
    "technologicalRootCause",
    "geopoliticalRootCause",
    "ethicalRootCause",
    "caseStudies",
  ];

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<IEnginePairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    const messages = [
      new SystemMessage(
        `
        You are an AI expert trained to rank search queries based on their relevance to problem statement and it's root causes.

        Instructions:
        1. You will receive a problem statement.
        2. You will also see two root causes web search queries, marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and importance in relation to searching for root causes.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      new HumanMessage(
        `
        ${this.renderProblemStatement()}

        Root Causes Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "rank-search-queries",
      IEngineConstants.searchQueryRankingsModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async process() {
    this.logger.info("Rank Root Causes Search Queries Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.searchQueryRankingsModel.temperature,
      maxTokens: IEngineConstants.searchQueryRankingsModel.maxOutputTokens,
      modelName: IEngineConstants.searchQueryRankingsModel.name,
      verbose: IEngineConstants.searchQueryRankingsModel.verbose,
    });

    for (const searchQueryType of this.rootCauseTypes) {
      this.logger.info(`Ranking search queries for ${searchQueryType}`);
      let queriesToRank =
        this.memory.problemStatement.rootCauseSearchQueries![
          searchQueryType as PSRootCauseWebPageTypes
        ];
      const index = -1;

      this.setupRankingPrompts(index, queriesToRank);

      await this.performPairwiseRanking(index);

      this.logger.info(
        `Ranking before: ${JSON.stringify(queriesToRank, null, 2)}`
      );

      this.memory.problemStatement.rootCauseSearchQueries![
        searchQueryType as PSRootCauseWebPageTypes
      ] = this.getOrderedListOfItems(index) as string[];

      this.logger.info(
        `Ranking after: ${JSON.stringify(
          this.memory.problemStatement.rootCauseSearchQueries![
            searchQueryType as PSRootCauseWebPageTypes
          ],
          null,
          2
        )}`
      );
    }

    await this.saveMemory();

    this.logger.info("Rank Root Causes Search Queries Processor: Done");
  }
}
