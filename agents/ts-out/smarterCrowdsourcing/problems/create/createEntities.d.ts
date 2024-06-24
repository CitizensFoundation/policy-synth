import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateEntitiesProcessor extends BaseProblemSolvingAgent {
    renderRefinePrompt(subProblemIndex: number, results: PsAffectedEntity[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<(SystemMessage | HumanMessage)[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map