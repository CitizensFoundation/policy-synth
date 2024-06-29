import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export declare class RankProsConsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    voteOnPromptPair(subProblemIndex: number, promptPair: number[], additionalData: {
        solution: string;
        prosOrCons: "pros" | "cons";
        subProblemIndex: number;
    }): Promise<PsPairWiseVoteResults>;
    convertProsConsToObjects(prosCons: string[]): PsProCon[];
    process(): Promise<void>;
    processSubProblem(subProblem: PsSubProblem, subProblemIndex: number): Promise<void>;
    renderSolution(solution: PsSolution): string;
}
//# sourceMappingURL=rankProsCons.d.ts.map