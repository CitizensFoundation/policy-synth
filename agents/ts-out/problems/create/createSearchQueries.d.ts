import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class CreateSearchQueriesProcessor extends BaseProlemSolvingAgent {
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<(SystemMessage | HumanMessage)[]>;
    renderEntityPrompt(problem: string, entity: IEngineAffectedEntity): Promise<(SystemMessage | HumanMessage)[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map