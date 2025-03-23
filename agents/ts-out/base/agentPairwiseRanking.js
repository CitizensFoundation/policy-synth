import pLimit from "p-limit";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PolicySynthAgent } from "./agent.js";
export class PairwiseRankingAgent extends PolicySynthAgent {
    get maxModelTokensOut() { return 3000; }
    get modelTemperature() { return 0.0; }
    defaultModelSize = PsAiModelSize.Medium;
    defaultModelType = PsAiModelType.Text;
    prompts = {};
    allItems = {};
    INITIAL_ELO_RATING = 1000;
    K_FACTOR_INITIAL = 60; // Initial K-factor
    K_FACTOR_MIN = 10; // Minimum K-factor
    NUM_COMPARISONS_FOR_MIN_K = 20; // Comparisons to reach min K
    maxNumberOfPrompts = process.env.PS_MAX_PAIRWISE_PROMPTS
        ? parseInt(process.env.PS_MAX_PAIRWISE_PROMPTS)
        : 750;
    // Concurrency limit
    maxParallellRanking = 1;
    // Elo tracking
    numComparisons = {};
    KFactors = {};
    eloRatings = {};
    // For progress display
    progressFunction = undefined;
    updatePrefix = "Pairwise Ranking";
    disableRelativeProgress = false;
    fisherYatesShuffle(array) {
        if (array && array.length > 0) {
            for (let i = array.length - 1; i > 0; i--) {
                const randomIndex = Math.floor(Math.random() * (i + 1));
                [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
            }
            return array;
        }
        else {
            this.logger.warn(`Array is empty or undefined`);
            return array;
        }
    }
    setupRankingPrompts(subProblemIndex, allItems, maxPrompts = undefined, updateFunction = undefined, maxParallellRanking = 1) {
        this.progressFunction = updateFunction;
        this.maxParallellRanking = maxParallellRanking;
        this.logger.info(`Item count for sub-problem ${subProblemIndex}: ${allItems.length}`);
        // Shuffle items in place
        allItems = this.fisherYatesShuffle(allItems);
        this.allItems[subProblemIndex] = allItems;
        this.maxNumberOfPrompts =
            maxPrompts ||
                Math.max(250, Math.floor(((allItems.length * (allItems.length - 1)) / 2) *
                    (process.env.PS_PAIRWISE_PROMPT_FRACTION
                        ? parseFloat(process.env.PS_PAIRWISE_PROMPT_FRACTION)
                        : 0.75)));
        this.logger.debug(`Max number of prompts: ${this.maxNumberOfPrompts}`);
        this.prompts[subProblemIndex] = [];
        this.numComparisons[subProblemIndex] = {};
        this.KFactors[subProblemIndex] = {};
        this.eloRatings[subProblemIndex] = {};
        // Build pairwise list
        for (let i = 0; i < this.allItems[subProblemIndex].length; i++) {
            for (let j = i + 1; j < this.allItems[subProblemIndex].length; j++) {
                this.prompts[subProblemIndex].push([i, j]);
            }
            this.eloRatings[subProblemIndex][i] = this.INITIAL_ELO_RATING;
            this.numComparisons[subProblemIndex][i] = 0;
            this.KFactors[subProblemIndex][i] = this.K_FACTOR_INITIAL;
        }
        // Reduce the prompt list if necessary
        const totalPrompts = this.prompts[subProblemIndex].length;
        const numToRemove = totalPrompts - this.maxNumberOfPrompts;
        if (numToRemove > 0) {
            this.logger.info(`Current length: ${totalPrompts}`);
            // Randomly select the prompts we want to keep
            const selectedIndices = new Set();
            while (selectedIndices.size < this.maxNumberOfPrompts) {
                const randomIndex = Math.floor(Math.random() * totalPrompts);
                selectedIndices.add(randomIndex);
            }
            const tempPrompts = [];
            for (const index of selectedIndices) {
                tempPrompts.push(this.prompts[subProblemIndex][index]);
            }
            this.prompts[subProblemIndex] = tempPrompts;
        }
    }
    /**
     * Example helper that calls the LLM and interprets the response.
     * (You might already have your own version; this is just an illustration.)
     */
    async getResultsFromLLM(subProblemIndex, messages, itemOneIndex, itemTwoIndex) {
        let wonItemIndex = -1;
        let lostItemIndex = -1;
        // Simplified example. Real code would do your normal LLM call + parse result.
        const maxRetryCount = process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT
            ? parseInt(process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT)
            : 7;
        let retry = true;
        let retryCount = 0;
        while (retry && retryCount < maxRetryCount) {
            try {
                // Suppose we call the model (placeholder):
                const winningItemText = await this.callModel(this.defaultModelType, this.defaultModelSize, messages, { parseJson: false });
                if (!winningItemText) {
                    throw new Error("No winning item text");
                }
                const trimmed = winningItemText.trim().toLowerCase();
                if (["one", "pro one", "con one"].includes(trimmed)) {
                    this.logger.info(`Item One won`);
                    wonItemIndex = itemOneIndex;
                    lostItemIndex = itemTwoIndex;
                }
                else if (["two", "pro two", "con two"].includes(trimmed)) {
                    this.logger.info(`Item Two won`);
                    wonItemIndex = itemTwoIndex;
                    lostItemIndex = itemOneIndex;
                }
                else {
                    // Could be a tie or invalid response
                    this.logger.info(`No clear winner from model`);
                    wonItemIndex = -1;
                    lostItemIndex = -1;
                }
                retry = false;
            }
            catch (err) {
                this.logger.error("Error getting results from LLM");
                retryCount++;
                if (retryCount < maxRetryCount) {
                    // Wait a bit, then retry
                    await new Promise((resolve) => setTimeout(resolve, 4500 + retryCount * 5000));
                }
                else {
                    throw err;
                }
            }
        }
        // Save state etc.
        await this.scheduleMemorySave();
        this.checkLastMemorySaveError();
        await this.checkProgressForPauseOrStop();
        return { subProblemIndex, wonItemIndex, lostItemIndex };
    }
    /**
     * Elo K-factor schedule: linearly decrease from K_FACTOR_INITIAL to K_FACTOR_MIN
     * over NUM_COMPARISONS_FOR_MIN_K comparisons.
     */
    getUpdatedKFactor(numComparisons) {
        if (numComparisons >= this.NUM_COMPARISONS_FOR_MIN_K) {
            return this.K_FACTOR_MIN;
        }
        else {
            return (this.K_FACTOR_INITIAL -
                ((this.K_FACTOR_INITIAL - this.K_FACTOR_MIN) * numComparisons) /
                    this.NUM_COMPARISONS_FOR_MIN_K);
        }
    }
    /**
     * Perform pairwise ranking using `p-limit` for concurrency-limited parallel calls.
     *
     * - We dispatch all prompt-pairs to the model in parallel (limited by maxParallellRanking).
     * - Each LLM call returns a winner-loser result.
     * - We apply Elo updates **in index order** to maintain stable, deterministic Elo results.
     */
    async performPairwiseRanking(subProblemIndex, additionalData) {
        this.logger.info("Performing pairwise ranking");
        this.logger.debug(`Sub-problem index: ${subProblemIndex}`);
        const prompts = this.prompts[subProblemIndex];
        const limit = pLimit(this.maxParallellRanking);
        // Keep track of the pairwise outcomes in an array, indexed the same as prompts
        const matchResults = new Array(prompts.length);
        // Next prompt index that should be applied to Elo updates
        let nextToApply = 0;
        //
        // Function to apply consecutive completed results in strict ascending order.
        //
        const applyResultsInOrder = () => {
            // As long as we have a result at the next index, apply it
            while (nextToApply < prompts.length &&
                matchResults[nextToApply] !== undefined) {
                const { wonItemIndex, lostItemIndex } = matchResults[nextToApply];
                this.logger.info(`Applying prompt ${nextToApply + 1} of ${prompts.length}`);
                if (this.progressFunction) {
                    this.progressFunction(`${nextToApply + 1}/${prompts.length}`);
                }
                const progress = ((nextToApply + 1) / prompts.length) * 100;
                this.updateRangedProgress(this.disableRelativeProgress ? undefined : progress, `${this.updatePrefix}\n${nextToApply + 1}/${prompts.length}`);
                // If it's a tie/invalid, skip Elo update
                if (wonItemIndex === -1 && lostItemIndex === -1) {
                    this.logger.info(`Neither item won, skipping Elo update for prompt ${nextToApply}`);
                }
                else {
                    this.updateElo(subProblemIndex, wonItemIndex, lostItemIndex);
                }
                nextToApply++;
            }
        };
        //
        // Build an array of tasks; each wraps the LLM call in a concurrency-limited function
        // Then, once a single call finishes, we store the result and try applying it (and any subsequent).
        //
        const tasks = prompts.map((promptPair, i) => limit(async () => {
            // Get the result from your custom voting function or LLM
            const { wonItemIndex, lostItemIndex } = await this.voteOnPromptPair(subProblemIndex, promptPair, additionalData);
            // Store the result in the same index as the prompt
            matchResults[i] = {
                wonItemIndex: wonItemIndex === undefined ? -1 : wonItemIndex,
                lostItemIndex: lostItemIndex === undefined ? -1 : lostItemIndex
            };
            // Attempt to apply this result (and possibly more) in order
            applyResultsInOrder();
        }));
        // Wait for all concurrency-limited tasks to finish
        await Promise.all(tasks);
        // If there's any remaining un-applied result (unlikely unless partial?), apply them
        applyResultsInOrder();
    }
    /**
     * Helper to handle the actual Elo math once we know the winner/loser.
     */
    updateElo(subProblemIndex, wonItemIndex, lostItemIndex) {
        const winnerRating = this.eloRatings[subProblemIndex][wonItemIndex];
        const loserRating = this.eloRatings[subProblemIndex][lostItemIndex];
        // Standard Elo expected score
        const expectedWin = 1.0 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
        const winnerK = this.KFactors[subProblemIndex][wonItemIndex];
        const loserK = this.KFactors[subProblemIndex][lostItemIndex];
        const newWinnerRating = winnerRating + winnerK * (1 - expectedWin);
        const newLoserRating = loserRating + loserK * (0 - (1 - expectedWin));
        // Apply new ratings
        this.eloRatings[subProblemIndex][wonItemIndex] = newWinnerRating;
        this.eloRatings[subProblemIndex][lostItemIndex] = newLoserRating;
        // Increment comparisons
        this.numComparisons[subProblemIndex][wonItemIndex] += 1;
        this.numComparisons[subProblemIndex][lostItemIndex] += 1;
        // Update K-factors
        this.KFactors[subProblemIndex][wonItemIndex] = this.getUpdatedKFactor(this.numComparisons[subProblemIndex][wonItemIndex]);
        this.KFactors[subProblemIndex][lostItemIndex] = this.getUpdatedKFactor(this.numComparisons[subProblemIndex][lostItemIndex]);
    }
    getOrderedListOfItems(subProblemIndex, setEloRatings = false, customEloRatingKey) {
        this.logger.info("Getting ordered list of items");
        let allItems = this.allItems[subProblemIndex];
        if (!allItems) {
            return [];
        }
        // Optionally set the elo rating on each item
        if (setEloRatings) {
            for (let i = 0; i < allItems.length; i++) {
                if (customEloRatingKey) {
                    allItems[i][customEloRatingKey] =
                        this.eloRatings[subProblemIndex][i];
                }
                else {
                    allItems[i].eloRating =
                        this.eloRatings[subProblemIndex][i];
                }
            }
        }
        // Build a sorted array
        const orderedItems = allItems.map((item, index) => ({
            item,
            rating: this.eloRatings[subProblemIndex][index],
        }));
        // Descending rating
        orderedItems.sort((a, b) => b.rating - a.rating);
        // Return just the items in order
        return orderedItems.map((o) => o.item);
    }
}
//# sourceMappingURL=agentPairwiseRanking.js.map