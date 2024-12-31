import { PsAgentFactoryBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsAgentFactoryProgrammingAgent extends PsAgentFactoryBaseProgrammingAgent {
    implementChanges(): Promise<void>;
    searchForSolutionsToErrors(currentErrors: string): Promise<void>;
    createAndRunActionPlan(currentErrors?: string | undefined): Promise<void>;
    implementTask(): Promise<void>;
}
//# sourceMappingURL=programmingAgent.d.ts.map