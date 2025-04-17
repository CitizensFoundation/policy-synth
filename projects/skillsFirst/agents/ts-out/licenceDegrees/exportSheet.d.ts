import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * Google‑Sheets exporter for {@link JobTitleLicenseDegreeAnalysisAgent} results.
 *
 * It creates (or appends to) a worksheet – default name "License Degree Analysis" –
 * and writes two header rows followed by one row per analysis result.  All writes
 * are chunked so very large result sets won’t hit the Sheets API request quota.
 *
 * The exporter intentionally contains **no AI‑model calls** (`skipAiModels = true`).
 */
export declare class SheetsLicenseDegreeExportAgent extends PolicySynthAgent {
    memory: any;
    private readonly chunkSize;
    private sheetsConnector;
    private sheetName;
    /**
     * Because the agent only moves data into Google Sheets, we skip model selection.
     * This speeds up initialisation and avoids unnecessary credits.
     */
    skipAiModels: boolean;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number, sheetName?: string);
    /**
     * Converts an array of {@link LicenseDegreeAnalysisResult}s into a two‑dimensional
     * array and streams it into Google Sheets.  The method is a drop‑in counterpart
     * of {@link SheetsJobDescriptionExportAgent.processJsonData} so both can be
     * orchestrated by the same calling code, if desired.
     */
    processJsonData(json: LicenseDegreeExportInput): Promise<void>;
    private generateSheetData;
    /**
     * Break the data into {{@link chunkSize}}‑sized pieces and update the sheet
     * range‑by‑range to stay within API limits.
     */
    private writeInChunks;
    private colIdxToLetter;
    private sanitiseData;
    private toStr;
}
//# sourceMappingURL=exportSheet.d.ts.map