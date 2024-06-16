import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateProsConsProcessor extends BaseProblemSolvingAgent {
    renderCurrentSolution(solution: PsSolution): string;
    renderRefinePrompt(prosOrCons: string, results: string[], subProblemIndex: number, solution: PsSolution): Promise<(HumanMessage | SystemMessage)[]>;
    renderCreatePrompt(prosOrCons: string, subProblemIndex: number, solution: PsSolution): Promise<(HumanMessage | SystemMessage)[]>;
    createProsCons(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProsCons.d.ts.map