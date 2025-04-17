import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class RequirementExtractorAgent extends PolicySynthAgent {
    memory: LicenseDegreeAnalysisMemoryData;
    constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number);
    extractRequirements(url: string): Promise<string>;
}
//# sourceMappingURL=requirementsExtractor.d.ts.map