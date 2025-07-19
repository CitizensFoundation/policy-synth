import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

export class SheetsEducationRequirementExportAgent extends PolicySynthAgent {
  declare memory: any;
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName: string;
  private readonly chunkSize = 500;
  skipAiModels = true;

  constructor(agent: PsAgent, memory: any, start: number, end: number, sheetName = "Sheet1") {
    super(agent, memory, start, end);
    this.sheetName = sheetName;
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;
    if (!this.sheetsConnector) {
      throw new Error("Google Sheets connector not found");
    }
  }

  async processJsonData(rows: EducationRequirementResearchRow[]): Promise<void> {
    await this.updateRangedProgress(0, "Starting Education Requirement export");
    const data = this.generateSheetData(rows);
    const sanitized = this.sanitiseData(data);
    await this.writeInChunks(sanitized);
    await this.updateRangedProgress(100, "Google Sheets export completed");
  }

  private generateSheetData(rows: EducationRequirementResearchRow[]): (string | number)[][] {
    const headers = [
      "Job Title",
      "Source URL",
      "Stated Degree Requirement",
      "Reasoning",
      "Elo Rating",
    ];
    const shortHeaders = headers.map(h => {
      const idx = h.lastIndexOf(".");
      return idx === -1 ? h : h.substring(idx + 1);
    });
    const sheetRows: (string | number)[][] = [headers, shortHeaders];

    for (const row of rows) {
      if (!row.analysisResults) continue;
      for (const res of row.analysisResults) {
        sheetRows.push([
          this.toStr(res.jobTitle),
          this.toStr(res.sourceUrl),
          this.toStr(res.statedDegreeRequirement),
          this.toStr(res.reasoning),
          Math.round(res.eloRating ?? 0),
        ]);
      }
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
    return data.map(row =>
      row.map(cell => {
        if (cell === undefined || cell === null) return "";
        if (typeof cell === "number") return cell;
        if (typeof cell === "object") return JSON.stringify(cell);
        return String(cell);
      })
    );
  }

  private toStr(val: any): string {
    return val !== undefined && val !== null ? String(val) : "";
  }
}
