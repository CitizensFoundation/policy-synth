import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateSearchQueriesProcessor extends BaseProcessor {
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<(HumanMessage | SystemMessage)[]>;
    renderEntityPrompt(problem: string, entity: IEngineAffectedEntity): Promise<(HumanMessage | SystemMessage)[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map