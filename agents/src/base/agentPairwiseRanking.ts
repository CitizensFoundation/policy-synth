import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PolicySynthAgent } from "./agent.js";

export abstract class PairwiseRankingAgent extends PolicySynthAgent {
  protected get maxModelTokensOut(): number { return 3000; }
  protected get modelTemperature(): number { return 0.0; }

  defaultModelSize = PsAiModelSize.Medium;
  defaultModelType = PsAiModelType.Text;

  prompts: Record<number, number[][]> = {};
  allItems: Record<number, (PsEloRateable[] | string[]) | undefined> = {};
  INITIAL_ELO_RATING: number = 1000;
  K_FACTOR_INITIAL: number = 60; // Initial K-factor
  K_FACTOR_MIN: number = 10; // Minimum K-factor
  NUM_COMPARISONS_FOR_MIN_K: number = 20; // Number of comparisons for K to reach its minimum
  maxNumberOfPrompts: number = process.env.PS_MAX_PAIRWISE_PROMPTS
    ? parseInt(process.env.PS_MAX_PAIRWISE_PROMPTS)
    : 750;

  // New property for concurrency
  maxParallellRanking: number = 1;

  numComparisons: Record<number, Record<number, number>> = {};
  KFactors: Record<number, Record<number, number>> = {};
  eloRatings: Record<number, Record<number, number>> = {};

  progressFunction: Function | undefined = undefined;

  updatePrefix = "Pairwise Ranking";

  disableRelativeProgress = false;

  fisherYatesShuffle(array: any[]) {
    if (array && array.length > 0) {
      for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]]; // Swap the elements
      }
      return array;
    } else {
      this.logger.warn(`Array is empty or undefined`);
      return array;
    }
  }

  setupRankingPrompts(
    subProblemIndex: number,
    allItems: PsEloRateable[] | string[],
    maxPrompts: number | undefined = undefined,
    updateFunction: Function | undefined = undefined,
    maxParallellRanking: number = 1
  ) {
    this.progressFunction = updateFunction;
    this.maxParallellRanking = maxParallellRanking;

    this.logger.info(
      `Item count for sub-problem ${subProblemIndex}: ${allItems.length}`
    );

    allItems = this.fisherYatesShuffle(allItems);

    this.allItems[subProblemIndex] = allItems;
    this.maxNumberOfPrompts =
      maxPrompts ||
      Math.max(
        250,
        Math.floor(
          ((allItems.length * (allItems.length - 1)) / 2) *
            (process.env.PS_PAIRWISE_PROMPT_FRACTION
              ? parseFloat(process.env.PS_PAIRWISE_PROMPT_FRACTION!)
              : 0.75)
        )
      );

    this.logger.debug(`Max number of prompts: ${this.maxNumberOfPrompts}`);
    this.prompts[subProblemIndex] = [];
    this.numComparisons[subProblemIndex] = {};
    this.KFactors[subProblemIndex] = {};
    this.eloRatings[subProblemIndex] = {};

    for (let i = 0; i < this.allItems[subProblemIndex]!.length; i++) {
      //this.logger.debug(`Current number of Prompts looped ${i}`);

      for (let j = i + 1; j < this.allItems[subProblemIndex]!.length; j++) {
        this.prompts[subProblemIndex].push([i, j]);
      }
      this.eloRatings[subProblemIndex][i] = this.INITIAL_ELO_RATING;

      this.numComparisons[subProblemIndex][i] = 0; // Initialize number of comparisons
      this.KFactors[subProblemIndex][i] = this.K_FACTOR_INITIAL; // Initialize K-factor
    }

    this.logger.debug(`Before randomizing MaxPrompts`);

    const tempPrompts = [];
    const numToRemove =
      this.prompts[subProblemIndex].length - this.maxNumberOfPrompts;
    if (numToRemove > 0) {
      this.logger.info(
        `Current length: ${this.prompts[subProblemIndex].length}`
      );
      const randomIndices = new Set<number>();
      while (randomIndices.size < this.maxNumberOfPrompts) {
        const randomIndex = Math.floor(
          Math.random() * this.prompts[subProblemIndex].length
        );
        randomIndices.add(randomIndex);
      }
      for (const index of randomIndices) {
        tempPrompts.push(this.prompts[subProblemIndex][index]);
      }
      this.prompts[subProblemIndex] = tempPrompts;
    }
  }

  abstract voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[],
    additionalData?: any
  ): Promise<PsPairWiseVoteResults>;

  async getResultsFromLLM(
    subProblemIndex: number,
    messages: PsModelMessage[],
    itemOneIndex: number,
    itemTwoIndex: number
  ) {
    let wonItemIndex;
    let lostItemIndex;

    const maxRetryCount = process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT
      ? parseInt(process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT)
      : 7;
    let retry = true;
    let retryCount = 0;

    try {
      while (retry && retryCount < maxRetryCount) {
        try {
          this.logger.debug(`Calling model`);
          const winningItemText = await this.callModel(
            this.defaultModelType,
            this.defaultModelSize,
            messages,
            { parseJson: false }
          );

          if (!winningItemText) {
            throw new Error("No winning item text");
          } else if (
            ["One", "Con One", "Pro One"].indexOf(winningItemText.trim()) > -1
          ) {
            this.logger.info(`Item One won`);
            wonItemIndex = itemOneIndex;
            lostItemIndex = itemTwoIndex;
          } else if (
            ["Two", "Con Two", "Pro Two"].indexOf(winningItemText.trim()) > -1
          ) {
            this.logger.info(`Item Two won`);
            wonItemIndex = itemTwoIndex;
            lostItemIndex = itemOneIndex;
          } else if (
            ["Neither", "None", "Both"].indexOf(winningItemText.trim()) > -1
          ) {
            this.logger.info(`Neither item won`);
            wonItemIndex = -1;
            lostItemIndex = -1;
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

      await this.scheduleMemorySave();
      this.checkLastMemorySaveError();
      await this.checkProgressForPauseOrStop();
    } catch (error) {
      throw error;
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
    this.logger.debug(`Sub-problem index: ${subProblemIndex}`);
    const prompts = this.prompts[subProblemIndex];

    try {
      // Process prompts in batches to respect maxParallellRanking
      for (let p = 0; p < prompts.length; p += this.maxParallellRanking) {
        // Extract a batch of prompts
        const chunk = prompts.slice(p, p + this.maxParallellRanking);

        // Process the current batch in parallel
        const results = await Promise.all(
          chunk.map(async (promptPair, idx) => {
            const absoluteIndex = p + idx;
            this.logger.debug(`Voting on prompt pair: ${promptPair} ...`);
            const { wonItemIndex, lostItemIndex } = await this.voteOnPromptPair(
              subProblemIndex,
              promptPair,
              additionalData
            );
            //this.logger.debug(`Won item index: ${wonItemIndex} Lost item index: ${lostItemIndex}`)
            return { promptPair, absoluteIndex, wonItemIndex, lostItemIndex };
          })
        );

        // Update Elo ratings in the order of completion
        for (const r of results) {
          const promptIndex = r.absoluteIndex;
          this.logger.info(`Prompt ${promptIndex + 1} of ${prompts.length}`);
          if (this.progressFunction) {
            this.progressFunction(`${promptIndex + 1}/${prompts.length}`);
          }

          const progress = ((promptIndex + 1) / (prompts.length - 1)) * 100;
          this.updateRangedProgress(
            this.disableRelativeProgress ? undefined : progress,
            `${this.updatePrefix}\n${promptIndex + 1}/${prompts.length}`
          );

          const { wonItemIndex, lostItemIndex } = r;
          if (wonItemIndex === -1 && lostItemIndex === -1) {
            this.logger.info(
              `Neither item won, not updating elo score for prompt ${promptIndex}`
            );
          } else if (
            wonItemIndex !== undefined &&
            lostItemIndex !== undefined
          ) {
            // Update Elo ratings
            const winnerRating = this.eloRatings[subProblemIndex][wonItemIndex];
            const loserRating = this.eloRatings[subProblemIndex][lostItemIndex];

            const expectedWin =
              1.0 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

            const winnerK = this.KFactors[subProblemIndex][wonItemIndex];
            const loserK = this.KFactors[subProblemIndex][lostItemIndex];

            const newWinnerRating = winnerRating + winnerK * (1 - expectedWin);
            const newLoserRating =
              loserRating + loserK * (0 - (1 - expectedWin));

            this.eloRatings[subProblemIndex][wonItemIndex] = newWinnerRating;
            this.eloRatings[subProblemIndex][lostItemIndex] = newLoserRating;

            // Update number of comparisons and K-factor for each item
            this.numComparisons[subProblemIndex][wonItemIndex] += 1;
            this.numComparisons[subProblemIndex][lostItemIndex] += 1;

            this.KFactors[subProblemIndex][wonItemIndex] =
              this.getUpdatedKFactor(
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
      }
    } catch (error: any) {
      this.logger.error("Error performing pairwise ranking");
      this.logger.error(error.stack);
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
    setEloRatings: boolean = false,
    customEloRatingKey: string | undefined = undefined
  ) {
    this.logger.info("Getting ordered list of items");
    let allItems = this.allItems[subProblemIndex];
    if (setEloRatings) {
      for (let i = 0; i < allItems!.length; i++) {
        if (customEloRatingKey) {
          (allItems![i] as any)[customEloRatingKey] =
            this.eloRatings[subProblemIndex][i];
        } else {
          (allItems![i] as PsEloRateable).eloRating =
            this.eloRatings[subProblemIndex][i];
        }
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
}
