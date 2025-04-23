import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export interface LicenseSeedInfo {
    licenseType: string;
    issuingAuthority: string;
    link: string;
}
export interface LicenseDegreeRow {
    jobTitle: string;
    seedLicenses: LicenseSeedInfo[];
}
/**
 * SheetsLicenseDegreeImportAgent
 * --------------------------------
 * Usage:
 *   const importer = new SheetsLicenseDegreeImportAgent(this.agent, this.memory);
 *   const rows     = await importer.importLicenseDegreeRows();
 */
export declare class SheetsLicenseDegreeImportAgent extends PolicySynthAgent {
    private sheetsConnector;
    private sheetName;
    private readonly startRow;
    private readonly maxRows;
    private readonly maxCols;
    constructor(agent: PsAgent, memory: any, startProgress?: number, endProgress?: number, sheetName?: string);
    /**
     * Reads the configured sheet and produces a list of rows that include both
     * link variants (when present).
     */
    importLicenseDegreeRows(): Promise<LicenseDegreeRow[]>;
    private buildRows;
    /** Locate any of the candidate header names, returns index or -1 */
    private safeGet;
    /** Convert zero‑based column index to spreadsheet letter (0 → A, 25 → Z, 26 → AA) */
    private columnIndexToLetter;
}
//# sourceMappingURL=importSheet.d.ts.map