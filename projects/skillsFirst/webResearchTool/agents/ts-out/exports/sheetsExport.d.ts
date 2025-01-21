import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * Agent to read JSON data (similar to jobDescriptions.json) and push a flattened
 * version to Google Sheets with the same columns/structure as the CSV version,
 * now with two header rows (full path / short name).
 */
export declare class GoogleSheetsJobDescriptionAgent extends PolicySynthAgent {
    memory: any;
    private sheetsConnector;
    private sheetName;
    private readonly chunkSize;
    skipAiModels: boolean;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number, sheetName: string);
    /**
     * Main method to receive the JSON data and push it into Google Sheets in chunks.
     * The JSON shape is something like:
     * {
     *   "agentId": "someAgentId",
     *   "jobDescriptions": [ ... ]
     * }
     */
    processJsonData(jsonData: JobDescriptionInput): Promise<void>;
    /**
     * Creates the 2D array (rows) that will be pushed to the Google Sheet,
     * with two header rows: (1) full path and (2) short name, followed by data rows.
     */
    private generateSheetData;
    /**
     * Breaks the 2D array into chunks of `this.chunkSize` and updates the sheet range by range.
     */
    private updateSheetInChunks;
    /**
     * Converts a zero-based column index to a spreadsheet column letter (e.g. 0 -> "A", 25 -> "Z", 26 -> "AA").
     */
    private columnIndexToLetter;
    /**
     * Makes sure values are strings (or for objects, uses JSON).
     */
    private sanitizeData;
    /**
     * Utility to handle null/undefined and return an empty string if so.
     */
    private safeString;
}
//# sourceMappingURL=sheetsExport.d.ts.map