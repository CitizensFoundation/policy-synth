import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateEntitiesProcessor extends BaseProblemSolvingAgent {
    renderRefinePrompt(subProblemIndex: number, results: IEngineAffectedEntity[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<(SystemMessage | HumanMessage)[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map