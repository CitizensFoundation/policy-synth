import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

/**
 * Simplified Google Sheets importer that reads two columns
 * (license type and education requirement) and returns
 * an array of {@link LicenseEducationRow}.
 */
export class SheetsLicenseEducationImportAgent extends PolicySynthAgent {
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName = "Sheet1";
  private readonly startRow = 1; // header row
  private readonly maxRows = 1000;
  private readonly maxCols = 2;

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
      true
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      throw new Error("Google Sheets connector not found");
    }
    if (sheetName) this.sheetName = sheetName;
  }

  /** Reads two columns from the configured worksheet. */
  async importRows(): Promise<LicenseEducationRow[]> {
    await this.updateRangedProgress(
      0,
      `Starting Google Sheets import: ${this.sheetsConnector.name}`
    );

    const range = `${this.sheetName}!A${this.startRow}:${this.columnIndexToLetter(
      this.maxCols - 1
    )}${this.maxRows}`;
    const rows = await this.sheetsConnector.getRange(range);

    if (!rows || rows.length < 2) {
      this.logger.warn(
        `No data or insufficient rows in sheet: ${this.sheetsConnector.name}`
      );
      return [];
    }

    // Assume first row is header
    const dataRows = rows.slice(1);

    const results: LicenseEducationRow[] = [];
    for (const row of dataRows) {
      const licenseType = (row[0] ?? "").toString().trim();
      const educationRequirement = (row[1] ?? "").toString().trim();
      if (!licenseType && !educationRequirement) continue;
      results.push({ licenseType, educationRequirement });
    }

    await this.updateRangedProgress(
      100,
      `Completed import from ${this.sheetsConnector.name}`
    );
    return results;
  }

  /** 0-based column index → spreadsheet letter */
  private columnIndexToLetter(index: number): string {
    let temp = index;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }
}
