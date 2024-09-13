import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SolutionsFromSearchSheetsExportAgent extends PolicySynthAgent {
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
     * Exports a list of PsSolution to a specified sheet with an optional source description.
     * This method handles both individual and combined exports.
     * @param sheetName The name of the sheet to export to.
     * @param solutions The list of solutions to export.
     * @param contextDescription A description of the context for progress updates.
     * @param sourceDescription (Optional) A description of the sources of the solutions.
     */
    private exportSolutions;
    /**
     * Prepares the data for exporting solutionsFromSearch.
     * @param solutions The list of solutions to prepare.
     * @param sourceDescription (Optional) A description of the sources of the solutions.
     * @returns A 2D array representing rows and columns for Google Sheets.
     */
    private prepareSolutionsData;
}
//# sourceMappingURL=sheetsWebSolutions.d.ts.map