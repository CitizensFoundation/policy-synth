import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateEntitiesProcessor extends BaseProblemSolvingAgent {
    renderRefinePrompt(subProblemIndex: number, results: PsAffectedEntity[]): Promise<(HumanMessage | SystemMessage)[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<(HumanMessage | SystemMessage)[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map