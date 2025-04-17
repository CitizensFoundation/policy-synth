import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class AuthoritativeSourceFinderAgent extends PolicySynthAgent {
    memory: LicenseDegreeAnalysisMemoryData;
    constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number);
    findSource(license: LicenseSeedInfo): Promise<string | undefined>;
}
//# sourceMappingURL=authorativeSourceFinder.d.ts.map