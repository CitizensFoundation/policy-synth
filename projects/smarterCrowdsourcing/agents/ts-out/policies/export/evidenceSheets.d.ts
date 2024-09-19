import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class PoliciesSheetsExportAgent extends PolicySynthAgent {
    private sheetsConnector;
    memory: PsSmarterCrowdsourcingMemoryData;
    constructor(agent: PsAgent, memory: PsSmarterCrowdsourcingMemoryData, startProgress: number, endProgress: number);
    process(): Promise<void>;
    /**
     * Sanitizes sheet names by removing or replacing invalid characters.
     * @param name The original sheet name.
     * @returns A sanitized sheet name.
     */
    private sanitizeSheetName;
    /**
     * Prepares the data for exporting a policy's webEvidence.
     * @param policy The policy whose evidence to prepare.
     * @returns A 2D array representing rows and columns for Google Sheets.
     */
    private preparePolicyEvidenceData;
}
//# sourceMappingURL=evidenceSheets.d.ts.map