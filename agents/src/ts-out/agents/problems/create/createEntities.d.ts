import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateEntitiesProcessor extends BaseProcessor {
    renderRefinePrompt(subProblemIndex: number, results: IEngineAffectedEntity[]): Promise<(SystemMessage | HumanMessage)[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<(SystemMessage | HumanMessage)[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map