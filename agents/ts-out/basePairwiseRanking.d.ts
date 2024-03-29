import { HumanMessage, SystemMessage } from "langchain/schema";
import { BaseProlemSolvingAgent } from "./baseProblemSolvingAgent.js";
export declare abstract class BasePairwiseRankingsProcessor extends BaseProlemSolvingAgent {
    prompts: Record<number, number[][]>;
    allItems: Record<number, (IEngineSearchResultItem[] | IEngineSolution[] | IEngineProblemStatement[] | IEngineAffectedEntity[] | IEngineProCon[] | string[]) | undefined>;
    INITIAL_ELO_RATING: number;
    K_FACTOR_INITIAL: number;
    K_FACTOR_MIN: number;
    NUM_COMPARISONS_FOR_MIN_K: number;
    maxNumberOfPrompts: number;
    numComparisons: Record<number, Record<number, number>>;
    KFactors: Record<number, Record<number, number>>;
    eloRatings: Record<number, Record<number, number>>;
    progressFunction: Function | undefined;
    fisherYatesShuffle(array: any[]): any[];
    setupRankingPrompts(subProblemIndex: number, allItems: IEngineSearchResultItem[] | IEngineSolution[] | IEngineProblemStatement[] | string[] | IEngineProCon[] | IEngineAffectedEntity[], maxPrompts?: number | undefined, updateFunction?: Function | undefined): void;
    abstract voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData?: any): Promise<IEnginePairWiseVoteResults>;
    getResultsFromLLM(subProblemIndex: number, stageName: PsMemoryStageTypes, modelConstant: IEngineBaseAIModelConstants, messages: (HumanMessage | SystemMessage)[], itemOneIndex: number, itemTwoIndex: number): Promise<{
        subProblemIndex: number;
        wonItemIndex: number | undefined;
        lostItemIndex: number | undefined;
    }>;
    getUpdatedKFactor(numComparisons: number): number;
    performPairwiseRanking(subProblemIndex: number, additionalData?: any): Promise<void>;
    getOrderedListOfItems(subProblemIndex: number, returnEloRatings?: boolean): (string | IEngineProblemStatement | IEngineSearchResultItem | IEngineProCon | IEngineSolution | IEngineAffectedEntity)[];
}
//# sourceMappingURL=basePairwiseRanking.d.ts.map