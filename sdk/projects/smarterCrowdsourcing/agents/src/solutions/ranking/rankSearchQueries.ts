import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";

export class RankSearchQueriesAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
  renderProblemDetail(
    additionalData: {
      subProblemIndex: number,
      currentEntity?: PsAffectedEntity;
      searchQueryType?: PsWebPageTypes;
      searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }
  ) {
    let detail = ``;

    if (additionalData.searchQueryTarget === "problemStatement") {
      detail = `
        ${this.renderProblemStatement()}
      `;
    } else if (additionalData.searchQueryTarget === "subProblem") {
      detail = `
        ${this.renderSubProblem(additionalData.subProblemIndex)}
      `;
    } else if (additionalData.searchQueryTarget === "entity") {
      detail = `
        ${this.renderSubProblem(additionalData.subProblemIndex)}

        Entity:
        ${additionalData!.currentEntity!.name}
        ${this.renderEntityPosNegReasons(additionalData!.currentEntity!)}
      `;
    }

    return detail;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[],
    additionalData: {
      currentEntity?: PsAffectedEntity;
      searchQueryType?: PsWebPageTypes;
      subProblemIndex: number;
      searchQueryTarget: "problemStatement" | "subProblem" | "entity";
    }
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    const messages = [
      this.createSystemMessage(
        `
        You are an AI expert trained to rank search queries based on their relevance to complex problem statements, sub-problems and affected entities.

        Instructions:
        1. You will receive a problem statement or a sub-problem, possibly along with entities and their impacts (both negative and positive).
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and affected entities.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `
        ${this.renderProblemDetail(additionalData)}

        Search Queries to Rank:

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
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async processSubProblems() {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        await this.processEntities(subProblemIndex);

        for (const searchQueryType of [
          "general",
          "scientific",
          "openData",
          "news",
        ] as const) {
          this.logger.info(
            `Ranking search queries for sub-problem ${subProblemIndex} ${searchQueryType}`
          );
          let queriesToRank =
            this.memory.subProblems[subProblemIndex].searchQueries[
              searchQueryType
            ];
          const index = this.getQueryIndex(searchQueryType) * (subProblemIndex+30);
          this.setupRankingPrompts(index, queriesToRank);
          await this.performPairwiseRanking(index, {
            subProblemIndex,
            searchQueryType,
            searchQueryTarget: "subProblem",
          });

          this.memory.subProblems[subProblemIndex].searchQueries[
            searchQueryType
          ] = this.getOrderedListOfItems(index) as string[];
        }

        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.debug("Sub Problems Ranked");
  }

  getQueryIndex(searchQueryType: PsWebPageTypes) {
    if (searchQueryType === "general") {
      return 2;
    } else if (searchQueryType === "scientific") {
      return 3;
    } else if (searchQueryType === "openData") {
      return 4;
    } else if (searchQueryType === "news") {
      return 5;
    } else {
      return 6;
    }
  }

  async processEntities(subProblemIndex: number) {
    for (
      let e = 0;
      e <
      Math.min(
        this.memory.subProblems[subProblemIndex].entities.length,
        this.maxTopEntitiesToSearch
      );
      e++
    ) {
      for (const searchQueryType of [
        "general",
        "scientific",
        "openData",
        "news",
      ] as const) {
        this.logger.info(
          `Ranking search queries for sub problem ${subProblemIndex} entity ${e} ${searchQueryType}`
        );

        const currentEntity =
          this.memory.subProblems[subProblemIndex].entities[e];

        let queriesToRank = currentEntity.searchQueries![searchQueryType];
        const index = this.getQueryIndex(searchQueryType) * (subProblemIndex+30) * (e+1);
        this.setupRankingPrompts(index, queriesToRank);
        await this.performPairwiseRanking(index, {
          subProblemIndex,
          currentEntity,
          searchQueryType,
          searchQueryTarget: "entity",
        });
        this.logger.debug("Entity Queries ranked");

        this.memory.subProblems[subProblemIndex].entities[e].searchQueries![
          searchQueryType
        ] = this.getOrderedListOfItems(index) as string[];
      }
    }
  }

  async process() {
    this.logger.info("Rank Search Queries Agent");
    super.process();

    this.logger.info("Rank Search Queries Agent: Sub Problems");

    await this.processSubProblems();

    this.logger.info("Rank Search Queries Agent: Problem Statement");

    for (const searchQueryType of [
      "general",
      "scientific",
      "openData",
      "news",
    ] as const) {
      let queriesToRank =
        this.memory.problemStatement.searchQueries![searchQueryType];

      this.setupRankingPrompts(-1, queriesToRank);
      await this.performPairwiseRanking(-1, {
        searchQueryType,
        searchQueryTarget: "problemStatement",
      });

      this.memory.problemStatement.searchQueries[searchQueryType] =
        this.getOrderedListOfItems(-1) as string[];

      this.logger.debug("Search Queries Ranked");
      this.logger.debug(
        this.memory.problemStatement.searchQueries[searchQueryType]
      );

      await this.saveMemory();
    }

    await this.saveMemory();

    this.logger.info("Rank Search Queries Agent: Done");
  }
}
