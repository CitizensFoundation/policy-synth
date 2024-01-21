import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export declare class RankProsConsProcessor extends BasePairwiseRankingsProcessor {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData: {
        solution: string;
        prosOrCons: "pros" | "cons";
        subProblemIndex: number;
    }): Promise<IEnginePairWiseVoteResults>;
    convertProsConsToObjects(prosCons: string[]): IEngineProCon[];
    process(): Promise<void>;
    processSubProblem(subProblem: IEngineSubProblem, subProblemIndex: number): Promise<void>;
    renderSolution(solution: IEngineSolution): string;
}
//# sourceMappingURL=rankProsCons.d.ts.map