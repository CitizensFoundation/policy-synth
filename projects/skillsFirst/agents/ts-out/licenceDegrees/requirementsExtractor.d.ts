import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class RequirementExtractorAgent extends PolicySynthAgent {
    memory: LicenseDegreeAnalysisMemoryData;
    constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number);
    /**
     * Fetch a remote document (HTML, PDF, XLS/XLSX, plain text) and return its
     * textual contents suitable for downstream LLM analysis.
     */
    extractRequirements(url: string): Promise<string>;
    private pdfToText;
    private xlsxToText;
}
//# sourceMappingURL=requirementsExtractor.d.ts.map