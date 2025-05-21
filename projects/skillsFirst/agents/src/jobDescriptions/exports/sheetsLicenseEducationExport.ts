import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

/**
 * Exports {@link LicenseEducationComparison} results to Google Sheets.
 *
 * Configure a spreadsheet connector pointing to your output workbook.  The
 * worksheet/tab name defaults to "Sheet1" but can be supplied to the
 * constructor or via a memory field when using the runner.
 */
export class SheetsLicenseEducationExportAgent extends PolicySynthAgent {
  declare memory: any;

  private sheetsConnector: PsBaseSheetConnector;
  private sheetName = "Sheet1";
  private readonly chunkSize = 500;

  skipAiModels = true;

  constructor(
    agent: PsAgent,
    memory: any,
    startProgress = 0,
    endProgress = 100,
    sheetName?: string
  ) {
    super(agent, memory, startProgress, endProgress);

    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      throw new Error("Google Sheets connector not found");
    }
    if (sheetName) this.sheetName = sheetName;
  }

  async exportComparisons(rows: LicenseEducationComparison[]): Promise<void> {
    await this.updateRangedProgress(0, "Starting License-Education sheet export");

    const data = this.generateSheetData(rows);
    const sanitized = this.sanitiseData(data);
    await this.writeInChunks(sanitized);

    await this.updateRangedProgress(100, "Google Sheets export completed");
  }

  private generateSheetData(rows: LicenseEducationComparison[]): (string | number)[][] {
    const headers = [
      "licenseType1",
      "eduReq1",
      "matchedLicenseType2",
      "eduReq2",
      "matchConfidence",
      "explanation",
    ];
    const sheetRows: (string | number)[][] = [headers, headers];

    for (const r of rows) {
      sheetRows.push([
        r.licenseType1,
        r.eduReq1,
        r.matchedLicenseType2 ?? "",
        r.eduReq2 ?? "",
        r.matchConfidence,
        r.explanation,
      ]);
    }
    return sheetRows;
  }

  private async writeInChunks(rows: (string | number)[][]): Promise<void> {
    if (!rows.length) return;
    const totalCols = rows[0].length;
    let pointer = 1;

    for (let i = 0; i < rows.length; i += this.chunkSize) {
      const chunk = rows.slice(i, i + this.chunkSize);
      const startRow = pointer;
      const endRow = pointer + chunk.length - 1;
      const endColLetter = this.colIdxToLetter(totalCols - 1);
      const range = `${this.sheetName}!A${startRow}:${endColLetter}${endRow}`;

      await this.sheetsConnector.updateRange(range, chunk as unknown as string[][]);
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

  private sanitiseData(data: (string | number)[][]): (string | number)[][] {
    return data.map((row) =>
      row.map((cell) => {
        if (cell === undefined || cell === null) return "";
        if (typeof cell === "number") return cell;
        if (typeof cell === "object") return JSON.stringify(cell);
        return String(cell);
      })
    );
  }
}
