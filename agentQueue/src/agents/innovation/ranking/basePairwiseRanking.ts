import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { BaseProcessor } from "../baseProcessor.js";
import { IEngineConstants } from "../../../constants.js";

export abstract class BasePairwiseRankingsProcessor extends BaseProcessor {
  prompts: Record<number, number[][]> = {};
  allItems: Record<
    number,
    | (
        | IEngineSearchResultItem[]
        | IEngineSolution[]
        | IEngineProblemStatement[]
        | IEngineAffectedEntity[]
        | IEngineProCon[]
        | string[]
      )
    | undefined
  > = {};
  INITIAL_ELO_RATING: number = 1000;
  K_FACTOR_INITIAL: number = 60; // Initial K-factor
  K_FACTOR_MIN: number = 10; // Minimum K-factor
  NUM_COMPARISONS_FOR_MIN_K: number = 20; // Number of comparisons for K to reach its minimum
  maxNumberOfPrompts: number = 600;

  numComparisons: Record<number, Record<number, number>> = {};
  KFactors: Record<number, Record<number, number>> = {};
  eloRatings: Record<number, Record<number, number>> = {};

  setupRankingPrompts(
    subProblemIndex: number,
    allItems:
      | IEngineSearchResultItem[]
      | IEngineSolution[]
      | IEngineProblemStatement[]
      | string[]
      | IEngineProCon[]
      | IEngineAffectedEntity[],
    maxPrompts: number | undefined = undefined
  ) {
    this.allItems[subProblemIndex] = allItems;
    this.maxNumberOfPrompts = maxPrompts || this.maxNumberOfPrompts;
    this.prompts[subProblemIndex] = [];
    this.numComparisons[subProblemIndex] = {};
    this.KFactors[subProblemIndex] = {};
    this.eloRatings[subProblemIndex] = {};

    for (let i = 0; i < this.allItems[subProblemIndex]!.length; i++) {
      for (let j = i + 1; j < this.allItems[subProblemIndex]!.length; j++) {
        this.prompts[subProblemIndex].push([i, j]);
      }
      this.eloRatings[subProblemIndex][i] = this.INITIAL_ELO_RATING;

      this.numComparisons[subProblemIndex][i] = 0; // Initialize number of comparisons
      this.KFactors[subProblemIndex][i] = this.K_FACTOR_INITIAL; // Initialize K-factor
    }

    while (this.prompts[subProblemIndex].length > this.maxNumberOfPrompts) {
      const randomIndex = Math.floor(
        Math.random() * this.prompts[subProblemIndex].length
      );
      this.prompts[subProblemIndex].splice(randomIndex, 1);
    }
  }

  abstract voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[],
    additionalData?: any
  ): Promise<IEnginePairWiseVoteResults>;

  async getResultsFromLLM(
    subProblemIndex: number,
    stageName: IEngineStageTypes,
    modelConstant: IEngineBaseAIModelConstants,
    messages: (HumanChatMessage | SystemChatMessage)[],
    itemOneIndex: number,
    itemTwoIndex: number
  ) {
    this.logger.info("Getting results from LLM");
    let wonItemIndex;
    let lostItemIndex;

    const maxRetryCount = IEngineConstants.rankingLLMmaxRetryCount;
    let retry = true;
    let retryCount = 0;

    while (retry && retryCount < maxRetryCount) {
      try {
        const winningItemText = await this.callLLM(
          stageName,
          modelConstant,
          messages,
          false
        );

        if (!winningItemText) {
          throw new Error("No winning item text");
        } else if (
          ["One", "Con One", "Pro One"].indexOf(winningItemText.trim()) > -1
        ) {
          this.logger.debug("One is the winner");
          wonItemIndex = itemOneIndex;
          lostItemIndex = itemTwoIndex;
        } else if (
          ["Two", "Con Two", "Pro Two"].indexOf(winningItemText.trim()) > -1
        ) {
          this.logger.debug("Two is the winner");
          wonItemIndex = itemTwoIndex;
          lostItemIndex = itemOneIndex;
        } else if (
          ["Neither", "None", "Both"].indexOf(winningItemText.trim()) > -1
        ) {
          wonItemIndex = -1;
          lostItemIndex = -1;
          this.logger.info(
            `LLM returned Neither, None or Both in pairwise ranking for prompt ${JSON.stringify(
              messages
            )}`
          );
        } else {
          this.logger.error(
            `Invalid winning item text ${winningItemText} for prompt ${JSON.stringify(
              messages
            )}`
          );
          wonItemIndex = -1;
          lostItemIndex = -1;
        }
        retry = false;
      } catch (error) {
        this.logger.error("Error getting results from LLM");
        this.logger.error(error);
        if (retryCount < maxRetryCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, 4500 + retryCount * 5000)
          );
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    return {
      subProblemIndex,
      wonItemIndex,
      lostItemIndex,
    };
  }

  getUpdatedKFactor(numComparisons: number) {
    // Linearly decrease K-factor from K_FACTOR_INITIAL to K_FACTOR_MIN
    if (numComparisons >= this.NUM_COMPARISONS_FOR_MIN_K) {
      return this.K_FACTOR_MIN;
    } else {
      return (
        this.K_FACTOR_INITIAL -
        ((this.K_FACTOR_INITIAL - this.K_FACTOR_MIN) * numComparisons) /
          this.NUM_COMPARISONS_FOR_MIN_K
      );
    }
  }

  async performPairwiseRanking(subProblemIndex: number, additionalData?: any) {
    this.logger.info("Performing pairwise ranking");
    this.logger.debug(`Sub-problem index: ${subProblemIndex}`)
    try {
      for (let p = 0; p < this.prompts[subProblemIndex].length; p++) {
        this.logger.info(
          `Prompt ${p + 1} of ${this.prompts[subProblemIndex].length}`
        );
        const promptPair = this.prompts[subProblemIndex][p];
        this.logger.debug(`Prompt pair: ${promptPair}`);
        const { wonItemIndex, lostItemIndex } = await this.voteOnPromptPair(
          subProblemIndex,
          promptPair,
          additionalData
        );
        //this.logger.debug(`Won item index: ${wonItemIndex} Lost item index: ${lostItemIndex}`)
        if (wonItemIndex === -1 && lostItemIndex === -1) {
          this.logger.info(`Neither won not updating elo score for prompt ${p}`);
        } else if (wonItemIndex !== undefined && lostItemIndex !== undefined) {
          // Update Elo ratings
          const winnerRating = this.eloRatings[subProblemIndex][wonItemIndex];
          const loserRating = this.eloRatings[subProblemIndex][lostItemIndex];

          const expectedWin =
            1.0 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

          const winnerK = this.KFactors[subProblemIndex][wonItemIndex];
          const loserK = this.KFactors[subProblemIndex][lostItemIndex];

          const newWinnerRating = winnerRating + winnerK * (1 - expectedWin);
          const newLoserRating = loserRating + loserK * (0 - (1 - expectedWin));

          this.eloRatings[subProblemIndex][wonItemIndex] = newWinnerRating;
          this.eloRatings[subProblemIndex][lostItemIndex] = newLoserRating;

          // Update number of comparisons and K-factor for each item
          this.numComparisons[subProblemIndex][wonItemIndex] += 1;
          this.numComparisons[subProblemIndex][lostItemIndex] += 1;

          this.KFactors[subProblemIndex][wonItemIndex] = this.getUpdatedKFactor(
            this.numComparisons[subProblemIndex][wonItemIndex]
          );
          this.KFactors[subProblemIndex][lostItemIndex] =
            this.getUpdatedKFactor(
              this.numComparisons[subProblemIndex][lostItemIndex]
            );
        } else {
          throw new Error("Invalid won or lost item index");
        }
      }
    } catch (error) {
      this.logger.error("Error performing pairwise ranking");
      if (typeof error === "object") {
        this.logger.error(JSON.stringify(error));
      } else {
        this.logger.error("Error performing pairwise ranking");
        this.logger.error(error);
      }

      throw error;
    }
  }

  getOrderedListOfItems(
    subProblemIndex: number,
    returnEloRatings: boolean = false
  ) {
    this.logger.info("Getting ordered list of items");
    let allItems = this.allItems[subProblemIndex];
    if (returnEloRatings) {
      for (let i = 0; i < allItems!.length; i++) {
        (
          allItems![i] as
            | IEngineSolution
            | IEngineAffectedEntity
            | IEngineSubProblem
        ).eloRating = this.eloRatings[subProblemIndex][i];
      }
    }

    const orderedItems = allItems!.map((item, index) => {
      return {
        item,
        rating: this.eloRatings[subProblemIndex][index],
      };
    });

    orderedItems.sort((a, b) => {
      return b.rating - a.rating;
    });

    const items = [];
    for (let i = 0; i < orderedItems.length; i++) {
      items.push(orderedItems[i].item);
    }

    return items;
  }

  async process() {
    super.process();
  }
}
