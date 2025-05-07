import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { AuthoritativeSourceFinderAgent } from "./authorativeSourceFinder.js";
export declare class JobTitleLicenseDegreeAnalysisAgent extends PolicySynthAgent {
    memory: LicenseDegreeAnalysisMemoryData;
    static readonly LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_BASE_ID = "a1b19c4b-79b1-491a-ba32-5fa4c9f74f1c";
    static readonly LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_VERSION = 1;
    authorativeSourceFinder: AuthoritativeSourceFinderAgent;
    constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number);
    private sheetImporter;
    loadSpreadsheet(): Promise<void>;
    process(): Promise<void>;
    /**
     * Analyse up‑to three sources for a single licence:
     *   • any "Licenses & Permits" URL that came from the sheet
     *   • any "o3 deep search" URL that came from the sheet
     *   • ⸻plus⸻ one authoritative URL we always try to discover ourselves
     *
     * For every usable URL we:
     *   1. pull the requirements text
     *   2. run the DegreeRequirementAnalyzer
     *   3. return an array of results (max 3 per row)
     */
    processLicense(row: LicenseDegreeRow): Promise<LicenseDegreeAnalysisResult[]>;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=licenceAnalysisAgent.d.ts.map