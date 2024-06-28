import { SolutionsSmarterCrowdsourcingAgent } from "../../scBaseSolutionsAgent.js";
export declare class CreateProsConsProcessor extends SolutionsSmarterCrowdsourcingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderRefinePrompt(prosOrCons: string, results: string[], subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    renderCreatePrompt(prosOrCons: string, subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    createProsCons(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProsCons.d.ts.map