import { PolicySynthAgent } from "@policysynth/agents/base/agent";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
interface ImportedJobDescriptionData {
    jobDescriptions: JobDescription[];
    connectorName: string;
}
export declare class SheetsJobDescriptionImportAgent extends PolicySynthAgent {
    private sheetsConnector;
    private sheetName;
    private startRow;
    private startCol;
    private maxRows;
    private maxCols;
    skipAiModels: boolean;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number, sheetName?: string);
    /**
     * Main entry point: Reads from the sheet, reconstructs jobDescriptions, returns them.
     */
    importJobDescriptions(): Promise<ImportedJobDescriptionData>;
    /**
     * NEW METHOD:
     * Gather *all* spreadsheet connectors and import job descriptions from each,
     * returning an array of results.
     */
    importJobDescriptionsFromAllConnectors(): Promise<ImportedJobDescriptionData[]>;
    /**
     * Rebuild the jobDescriptions array based on the same headers used in the export.
     */
    private reconstructJobDescriptionsFromSheet;
    /**
     * Build a single JobDescription from a single row and the corresponding headers.
     */
    private buildJobDescriptionObject;
    /**
     * Parse a single OccupationalCategory object from main + sub columns.
     * If your sheet might have multiple categories, pick the first or combine them
     * into a single object.
     */
    private parseOccupationalCategory;
    /**
     * Convert a joined educationRequirements string into an array of JobEducationRequirement.
     */
    private parseEducationRequirements;
    private parseBooleanIfPossible;
    private parseJsonIfPossible;
    private parseStringList;
    /**
     * Convert zero-based column index to spreadsheet letter (0->A, 25->Z, 26->AA)
     */
    private columnIndexToLetter;
}
export {};
//# sourceMappingURL=sheetsImport.d.ts.map