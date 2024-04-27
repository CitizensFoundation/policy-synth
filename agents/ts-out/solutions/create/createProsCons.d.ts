import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateProsConsProcessor extends BaseProblemSolvingAgent {
    renderCurrentSolution(solution: IEngineSolution): string;
    renderRefinePrompt(prosOrCons: string, results: string[], subProblemIndex: number, solution: IEngineSolution): Promise<(SystemMessage | HumanMessage)[]>;
    renderCreatePrompt(prosOrCons: string, subProblemIndex: number, solution: IEngineSolution): Promise<(SystemMessage | HumanMessage)[]>;
    createProsCons(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProsCons.d.ts.map