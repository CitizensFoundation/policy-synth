import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SolutionsSheetsExportAgent extends PolicySynthAgent {
    private sheetsConnector;
    memory: PsSmarterCrowdsourcingMemoryData;
    private allSubProblems;
    constructor(agent: PsAgent, memory: PsSmarterCrowdsourcingMemoryData, startProgress: number, endProgress: number);
    process(): Promise<void>;
    private getLatestGeneration;
    private exportSubProblemSolutions;
    private getUrlsFromFamily;
    private getSolutionByIndex;
    private prepareSolutionsData;
}
//# sourceMappingURL=googleSheets.d.ts.map