/*
 * SheetsLicenseDegreeImportAgent.ts
 * ---------------------------------------------------------------------------
 * A Google‑Sheets based importer that reads license/degree‑requirement rows
 * from the Skills‑First "NJ Job Descriptions" spreadsheet (or any compatible
 * sheet) and transforms them into the structured format expected by
 * JobTitleLicenseDegreeAnalysisAgent.  It captures **both** link columns that
 * appear in the sheet (the public "Licenses & Permits" URL and the secondary
 * "GPT‑4.5 deep search" URL) so that downstream agents can consider the user‑
 * supplied sources _before_ resorting to automated deep‑search.
 *
 * The implementation mirrors the pattern used by `SheetsJobDescriptionImportAgent`.
 * ---------------------------------------------------------------------------*/

import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

// ---------------------------------------------------------------------------
// Shared interfaces (duplicated here for clarity – they already exist in the
// original code base; remove duplicates if you have the canonical definitions)
// ---------------------------------------------------------------------------

export interface LicenseSeedInfo {
  licenseType: string;
  issuingAuthority: string;
  link: string; // May be empty – consumers should test
}

export interface LicenseDegreeRow {
  jobTitle: string;
  seedLicenses: LicenseSeedInfo[];
}

/**
 * SheetsLicenseDegreeImportAgent
 * --------------------------------
 * Usage:
 *   const importer = new SheetsLicenseDegreeImportAgent(this.agent, this.memory);
 *   const rows     = await importer.importLicenseDegreeRows();
 */
export class SheetsLicenseDegreeImportAgent extends PolicySynthAgent {
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName = "Sheet1"; // default; allow caller to override
  private readonly startRow = 1; // header row starts here (1‑based)
  private readonly maxRows = 10_000;
  private readonly maxCols = 40;

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

  /**
   * Reads the configured sheet and produces a list of rows that include both
   * link variants (when present).
   */
  async importLicenseDegreeRows(): Promise<LicenseDegreeRow[]> {
    await this.updateRangedProgress(0, `Starting Google Sheets import: ${this.sheetsConnector.name}`);

    const range = `${this.sheetName}!A${this.startRow}:${this.columnIndexToLetter(this.maxCols - 1)}${this.maxRows}`;
    const rows = await this.sheetsConnector.getRange(range);

    if (!rows || rows.length < 2) {
      this.logger.warn("No data or insufficient rows in sheet: " + this.sheetsConnector.name);
      return [];
    }

    const headers = rows[0].map((h: string) => (h ?? "").trim().toLowerCase());
    const dataRows: string[][] = rows.slice(1);

    const results = this.buildRows(headers, dataRows);

    await this.updateRangedProgress(100, `Completed import from ${this.sheetsConnector.name}`);
    return results;
  }

  /* ----------------------------------------------------------------------- */
  /* Internal helpers                                                        */
  /* ----------------------------------------------------------------------- */

  private buildRows(headers: string[], dataRows: string[][]): LicenseDegreeRow[] {
    // Define fixed 0-based column indices based on the sheet structure
    const idxTitle                    = 3;
    const idxLtPolicysynth            = 0;
    const idxAuthPolicysynth          = 1;
    const idxLinkLicenses             = 4;
    const idxLtGpt                    = 5;
    const idxAuthGpt                  = 6;
    const idxLinkGpt                  = 8;

    const rows: LicenseDegreeRow[] = [];

    for (const row of dataRows) {
      const jobTitle = this.safeGet(row, idxTitle);
      if (!jobTitle) continue; // skip empty

      const seedLicenses: LicenseSeedInfo[] = [];

      // -- Policysynth (human) link -------------------------------------------------
      const licenseTypeHuman = this.safeGet(row, idxLtPolicysynth);
      const issuingAuthHuman = this.safeGet(row, idxAuthPolicysynth);
      const linkHuman        = this.safeGet(row, idxLinkLicenses);
      if (licenseTypeHuman || linkHuman) {
        seedLicenses.push({
          licenseType: licenseTypeHuman || "",
          issuingAuthority: issuingAuthHuman || "",
          link: linkHuman || "",
        });
      }

      // -- GPT‑4.5 deep‑search link -------------------------------------------------
      const licenseTypeGpt  = this.safeGet(row, idxLtGpt);
      const issuingAuthGpt  = this.safeGet(row, idxAuthGpt);
      const linkGpt         = this.safeGet(row, idxLinkGpt);
      if (licenseTypeGpt || linkGpt) {
        seedLicenses.push({
          licenseType: licenseTypeGpt || licenseTypeHuman || "",
          issuingAuthority: issuingAuthGpt || issuingAuthHuman || "",
          link: linkGpt || "",
        });
      }

      if (seedLicenses.length === 0) continue; // Nothing useful on this row

      rows.push({ jobTitle, seedLicenses });
    }

    return rows;
  }

  /** Locate any of the candidate header names, returns index or -1 */
  /*
  private findHeaderIdx(headers: string[], candidates: string[]): number {
    for (const c of candidates) {
      const idx = headers.indexOf(c.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  }
  */

  private safeGet(row: string[], idx: number): string {
    if (idx === -1 || idx >= row.length) return "";
    return (row[idx] ?? "").toString().trim();
  }

  /** Convert zero‑based column index to spreadsheet letter (0 → A, 25 → Z, 26 → AA) */
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