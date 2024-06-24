import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSearchQueriesProcessor extends BaseProblemSolvingAgent {
    useLanguage: string | undefined;
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<(SystemMessage | HumanMessage)[]>;
    renderEntityPrompt(problem: string, entity: PsAffectedEntity): Promise<(SystemMessage | HumanMessage)[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map