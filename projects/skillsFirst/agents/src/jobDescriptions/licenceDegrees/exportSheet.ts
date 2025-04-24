import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

/**
 * Google‑Sheets exporter for {@link JobTitleLicenseDegreeAnalysisAgent} results.
 *
 * It creates (or appends to) a worksheet – default name "License Degree Analysis" –
 * and writes two header rows followed by one row per analysis result.  All writes
 * are chunked so very large result sets won’t hit the Sheets API request quota.
 *
 * The exporter intentionally contains **no AI‑model calls** (`skipAiModels = true`).
 */
export class SheetsLicenseDegreeExportAgent extends PolicySynthAgent {
  declare memory: any;

  private readonly chunkSize = 500;
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName: string;

  /**
   * Because the agent only moves data into Google Sheets, we skip model selection.
   * This speeds up initialisation and avoids unnecessary credits.
   */
  skipAiModels = true;

  constructor(
    agent: PsAgent,
    memory: any,
    startProgress: number,
    endProgress: number,
    sheetName = "Sheet1"
  ) {
    super(agent, memory, startProgress, endProgress);

    this.sheetName = sheetName;

    // ────────────────────────────────────────────────────────────────────────────
    // Locate the spreadsheet connector declared in the parent agent’s config
    // ────────────────────────────────────────────────────────────────────────────
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      throw new Error(
        "Google Sheets connector not found – did you configure one in Policy Synth?"
      );
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────────

  async processJsonData(rows: LicenseDegreeRow[]): Promise<void> {
    await this.updateRangedProgress(0, "Starting License‑Degree sheet export");

    const data2d = this.generateSheetData(rows);
    const sanitised = this.sanitiseData(data2d);

    await this.writeInChunks(sanitised);

    await this.updateRangedProgress(100, "Google Sheets export completed");
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ──────────────────────────────────────────────────────────────────────────────

  private generateSheetData(rows: LicenseDegreeRow[]): string[][] {
    // 1) Full‑path header row
    const headers: string[] = [
      "licenseType",
      "sourceUrl",
      "degreeRequiredStatus",
      "supportingEvidence",
      "confidenceScore",
      "reasoning",
    ];

    // 2) Short header row (label only after final dot – here identical to full)
    const shortHeaders = headers.map((h) => {
      const idx = h.lastIndexOf(".");
      return idx === -1 ? h : h.substring(idx + 1);
    });

    const sheetRows: string[][] = [headers, shortHeaders];

    for (const row of rows) {
      const analysisResults = row.analysisResults;
      if (!analysisResults) {
        this.logger.warn(
          `No analysis results for row: ${JSON.stringify(row, null, 2)}`
        );
        continue;
      }

      // 3) Data rows – one per analysis result
      for (const res of analysisResults) {
        sheetRows.push([
          this.toStr(res.licenseType),
          this.toStr(res.sourceUrl),
          this.toStr(res.degreeRequiredStatus),
          this.toStr(res.supportingEvidence),
          this.toStr(res.confidenceScore),
          this.toStr(res.reasoning),
        ]);
      }
    }

    return sheetRows;
  }

  /**
   * Break the data into {{@link chunkSize}}‑sized pieces and update the sheet
   * range‑by‑range to stay within API limits.
   */
  private async writeInChunks(rows: string[][]): Promise<void> {
    if (!rows.length) return;

    const totalCols = rows[0].length;
    let pointer = 1; // Google Sheets rows are 1‑based

    for (let i = 0; i < rows.length; i += this.chunkSize) {
      const chunk = rows.slice(i, i + this.chunkSize);
      const startRow = pointer;
      const endRow = pointer + chunk.length - 1;

      const endColLetter = this.colIdxToLetter(totalCols - 1);
      const range = `${this.sheetName}!A${startRow}:${endColLetter}${endRow}`;

      await this.sheetsConnector.updateRange(range, chunk);
      pointer += chunk.length;
    }
  }

  private colIdxToLetter(idx: number): string {
    let temp = idx;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  private sanitiseData(data: any[][]): string[][] {
    return data.map((row) =>
      row.map((cell) => {
        if (typeof cell === "object" && cell !== null)
          return JSON.stringify(cell);
        return cell === undefined || cell === null ? "" : String(cell);
      })
    );
  }

  private toStr(val: any): string {
    return val !== undefined && val !== null ? String(val) : "";
  }
}
