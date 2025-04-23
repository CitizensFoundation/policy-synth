/*
 * SheetsLicenseDegreeImportAgent.ts
 * ---------------------------------------------------------------------------
 * Google-Sheets importer for the “NJ Job Descriptions” workbook (simple row-by-row variant).
 *
 * Sheet column layout (0-based indexes → spreadsheet letters):
 *   0  A  licenseType – policysynth  (primary key; may be carried downward)
 *   1  B  issuingAuthorityPart1      (optional)
 *   2  C  issuingAuthorityPart2      (optional)
 *   3  D  titleOrPermit              (optional)
 *   4  E  licenseLink                (optional)
 *   5  F  licenceTypeForDeepResearch (optional)
 *   6  G  issuingAuthorityForDeepResearch (optional)
 *   7  H  degreeRequirementFromDeepResearch (optional)
 *   8  I  deepResearchLinks          (optional)
 *
 * Each physical row in the sheet becomes exactly one `LicenseDegreeRow`.
 * Empty cells are preserved as empty strings.
 */

import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

/* ------------------------------------------------------------------------- */
/* Row interface                                                             */
/* ------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------- */
/* SheetsLicenseDegreeImportAgent                                            */
/* ------------------------------------------------------------------------- */

export class SheetsLicenseDegreeImportAgent extends PolicySynthAgent {
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName = "Sheet1";
  private readonly startRow = 1;          // header row
  private readonly maxRows  = 10_000;
  private readonly maxCols  = 300;        // generous upper bound

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

  /* ----------------------------------------------------------------------- */
  /* Public API                                                              */
  /* ----------------------------------------------------------------------- */

  /** Reads the sheet and produces `LicenseDegreeRow` objects */
  async importLicenseDegreeRows(): Promise<LicenseDegreeRow[]> {
    await this.updateRangedProgress(0, `Starting Google Sheets import: ${this.sheetsConnector.name}`);

    const range = `${this.sheetName}!A${this.startRow}:${this.columnIndexToLetter(this.maxCols - 1)}${this.maxRows}`;
    const rows  = await this.sheetsConnector.getRange(range);

    if (!rows || rows.length < 2) {
      this.logger.warn(`No data or insufficient rows in sheet: ${this.sheetsConnector.name}`);
      return [];
    }

    const headers  = rows[0].map((h: string) => (h ?? "").trim().toLowerCase());
    const dataRows = rows.slice(1);

    this.logger.debug(`Headers: ${JSON.stringify(headers, null, 2)}`);
    this.logger.debug(`Row count (excluding header): ${dataRows.length}`);

    const results = this.buildRows(dataRows);

    await this.updateRangedProgress(100, `Completed import from ${this.sheetsConnector.name}`);
    return results;
  }

  /* ----------------------------------------------------------------------- */
  /* Internal helpers                                                        */
  /* ----------------------------------------------------------------------- */

  /** Convert sheet rows into structured objects */
  private buildRows(dataRows: string[][]): LicenseDegreeRow[] {
    /** Column indexes */
    const COL = {
      TYPE: 0,
      AUTH1: 1,
      AUTH2: 2,
      TITLE: 3,
      LINK: 4,
      TYPE_DR: 5,
      AUTH_DR: 6,
      DEGREE_DR: 7,
      LINKS_DR: 8,
    } as const;

    const rows: LicenseDegreeRow[] = [];
    let lastLicenseType = "";

    for (const [rowIdx, row] of dataRows.entries()) {
      const rawType = this.safeGet(row, COL.TYPE);
      if (rawType) lastLicenseType = rawType;

      if (!lastLicenseType) {
        this.logger.debug(`Row ${rowIdx + 2}: licenseType empty and no prior value – skipped`);
        continue;
      }

      const record: LicenseDegreeRow = {
        licenseType: lastLicenseType,
        issuingAuthorityPart1: this.safeGet(row, COL.AUTH1),
        issuingAuthorityPart2: this.safeGet(row, COL.AUTH2),
        titleOrPermit: this.safeGet(row, COL.TITLE),
        licenseLink: this.safeGet(row, COL.LINK),
        licenceTypeForDeepResearch: this.safeGet(row, COL.TYPE_DR),
        issuingAuthorityForDeepResearch: this.safeGet(row, COL.AUTH_DR),
        degreeRequirementFromDeepResearch: this.safeGet(row, COL.DEGREE_DR),
        deepResearchLinks: this.safeGet(row, COL.LINKS_DR),
      };

      // Skip rows that carry-forward the licenceType but have no other data
      const hasDetail = Object.entries(record).some(([key, val]) => key === "licenseType" ? false : !!val);
      if (!hasDetail) {
        this.logger.debug(`Row ${rowIdx + 2}: no detail columns – skipped`);
        continue;
      }

      rows.push(record);
    }

    return rows;
  }

  /** Safe getter with bounds-checking & trimming */
  private safeGet(row: string[], idx: number): string {
    if (idx === -1 || idx >= row.length) return "";
    return (row[idx] ?? "").toString().trim();
  }

  /** 0-based column index → spreadsheet letter (0 → A, 25 → Z, 26 → AA) */
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
