import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export declare class CreateProsConsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderRefinePrompt(prosOrCons: string, results: string[], subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    renderCreatePrompt(prosOrCons: string, subProblemIndex: number, solution: PsSolution): Promise<PsModelMessage[]>;
    createProsCons(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProsCons.d.ts.map