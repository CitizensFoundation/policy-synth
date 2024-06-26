import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class CreateSearchQueriesProcessor extends BaseSmarterCrowdsourcingAgent {
    useLanguage: string | undefined;
    renderCommonPromptSection(): string;
    renderProblemPrompt(problem: string): Promise<PsModelMessage[]>;
    renderEntityPrompt(problem: string, entity: PsAffectedEntity): Promise<PsModelMessage[]>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSearchQueries.d.ts.map