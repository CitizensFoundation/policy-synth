import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingAgent extends PsEngineerBaseProgrammingAgent {
    implementChanges(): Promise<void>;
    searchForSolutionsToErrors(currentErrors: string): Promise<void>;
    createAndRunActionPlan(currentErrors?: string | undefined): Promise<void>;
    implementTask(): Promise<void>;
}
//# sourceMappingURL=programmingAgent.d.ts.map