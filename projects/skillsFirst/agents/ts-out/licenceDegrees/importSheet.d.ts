import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SheetsLicenseDegreeImportAgent extends PolicySynthAgent {
    private sheetsConnector;
    private sheetName;
    private readonly startRow;
    private readonly maxRows;
    private readonly maxCols;
    constructor(agent: PsAgent, memory: any, startProgress?: number, endProgress?: number, sheetName?: string);
    /** Reads the sheet and produces `LicenseDegreeRow` objects */
    importLicenseDegreeRows(): Promise<LicenseDegreeRow[]>;
    /** Convert sheet rows into structured objects */
    private buildRows;
    /** Safe getter with bounds-checking & trimming */
    private safeGet;
    /** 0-based column index → spreadsheet letter (0 → A, 25 → Z, 26 → AA) */
    private columnIndexToLetter;
}
//# sourceMappingURL=importSheet.d.ts.map