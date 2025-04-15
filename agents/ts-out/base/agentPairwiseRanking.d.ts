import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PolicySynthAgent } from "./agent.js";
export declare abstract class PairwiseRankingAgent extends PolicySynthAgent {
    protected get maxModelTokensOut(): number;
    protected get modelTemperature(): number;
    defaultModelSize: PsAiModelSize;
    defaultModelType: PsAiModelType;
    prompts: Record<number, number[][]>;
    allItems: Record<number, (PsEloRateable[] | string[]) | undefined>;
    INITIAL_ELO_RATING: number;
    K_FACTOR_INITIAL: number;
    K_FACTOR_MIN: number;
    NUM_COMPARISONS_FOR_MIN_K: number;
    maxNumberOfPrompts: number;
    maxParallellRanking: number;
    numComparisons: Record<number, Record<number, number>>;
    KFactors: Record<number, Record<number, number>>;
    eloRatings: Record<number, Record<number, number>>;
    progressFunction: Function | undefined;
    updatePrefix: string;
    disableRelativeProgress: boolean;
    fisherYatesShuffle(array: any[]): any[];
    setupRankingPrompts(subProblemIndex: number, allItems: PsEloRateable[] | string[], maxPrompts?: number | undefined, updateFunction?: Function | undefined, maxParallellRanking?: number): void;
    /**
     * Abstract method that calls the LLM or any logic to decide which prompt item wins.
     * Must resolve with { wonItemIndex, lostItemIndex } (could be -1, -1 if there's no clear winner).
     */
    abstract voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<PsPairWiseVoteResults>;
    /**
     * Example helper that calls the LLM and interprets the response.
     * (You might already have your own version; this is just an illustration.)
     */
    getResultsFromLLM(subProblemIndex: number, messages: any[], itemOneIndex: number, itemTwoIndex: number, modelOptions?: PsCallModelOptions): Promise<PsPairWiseVoteResults>;
    /**
     * Elo K-factor schedule: linearly decrease from K_FACTOR_INITIAL to K_FACTOR_MIN
     * over NUM_COMPARISONS_FOR_MIN_K comparisons.
     */
    getUpdatedKFactor(numComparisons: number): number;
    /**
     * Perform pairwise ranking using `p-limit` for concurrency-limited parallel calls.
     *
     * - We dispatch all prompt-pairs to the model in parallel (limited by maxParallellRanking).
     * - Each LLM call returns a winner-loser result.
     * - We apply Elo updates **in index order** to maintain stable, deterministic Elo results.
     */
    performPairwiseRanking(subProblemIndex: number, additionalData?: any): Promise<void>;
    /**
     * Helper to handle the actual Elo math once we know the winner/loser.
     */
    private updateElo;
    getOrderedListOfItems(subProblemIndex: number, setEloRatings?: boolean, customEloRatingKey?: string): (string | PsEloRateable)[];
}
//# sourceMappingURL=agentPairwiseRanking.d.ts.map