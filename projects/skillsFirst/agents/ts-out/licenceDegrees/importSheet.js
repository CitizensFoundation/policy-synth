/*
 * SheetsLicenseDegreeImportAgent.ts
 * ---------------------------------------------------------------------------
 * A Google‑Sheets based importer that reads license/degree‑requirement rows
 * from the Skills‑First "NJ Job Descriptions" spreadsheet (or any compatible
 * sheet) and transforms them into the structured format expected by
 * JobTitleLicenseDegreeAnalysisAgent.  It captures **both** link columns that
 * appear in the sheet (the public “Licenses & Permits” URL and the secondary
 * “GPT‑4.5 deep search” URL) so that downstream agents can consider the user‑
 * supplied sources _before_ resorting to automated deep‑search.
 *
 * The implementation mirrors the pattern used by `SheetsJobDescriptionImportAgent`.
 * ---------------------------------------------------------------------------*/
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
/**
 * SheetsLicenseDegreeImportAgent
 * --------------------------------
 * Usage:
 *   const importer = new SheetsLicenseDegreeImportAgent(this.agent, this.memory);
 *   const rows     = await importer.importLicenseDegreeRows();
 */
export class SheetsLicenseDegreeImportAgent extends PolicySynthAgent {
    sheetsConnector;
    sheetName = "Sheet1"; // default; allow caller to override
    startRow = 1; // header row starts here (1‑based)
    maxRows = 10_000;
    maxCols = 40;
    constructor(agent, memory, startProgress = 0, endProgress = 100, sheetName) {
        super(agent, memory, startProgress, endProgress);
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, true);
        if (!this.sheetsConnector) {
            throw new Error("Google Sheets connector not found");
        }
        if (sheetName)
            this.sheetName = sheetName;
    }
    /* ----------------------------------------------------------------------- */
    /* Public API                                                              */
    /* ----------------------------------------------------------------------- */
    /**
     * Reads the configured sheet and produces a list of rows that include both
     * link variants (when present).
     */
    async importLicenseDegreeRows() {
        await this.updateRangedProgress(0, `Starting Google Sheets import: ${this.sheetsConnector.name}`);
        const range = `${this.sheetName}!A${this.startRow}:${this.columnIndexToLetter(this.maxCols - 1)}${this.maxRows}`;
        const rows = await this.sheetsConnector.getRange(range);
        if (!rows || rows.length < 2) {
            this.logger.warn("No data or insufficient rows in sheet: " + this.sheetsConnector.name);
            return [];
        }
        const headers = rows[0].map((h) => (h ?? "").trim().toLowerCase());
        const dataRows = rows.slice(1);
        const results = this.buildRows(headers, dataRows);
        await this.updateRangedProgress(100, `Completed import from ${this.sheetsConnector.name}`);
        return results;
    }
    /* ----------------------------------------------------------------------- */
    /* Internal helpers                                                        */
    /* ----------------------------------------------------------------------- */
    buildRows(headers, dataRows) {
        const getIdx = (needle) => headers.findIndex((h) => h === needle.toLowerCase());
        const idxTitle = this.findHeaderIdx(headers, ["title", "title - licenses", "job title"]);
        const idxLtPolicysynth = this.findHeaderIdx(headers, ["licensetype - policysynth", "licensetype", "license type - policysynth"]);
        const idxAuthPolicysynth = this.findHeaderIdx(headers, ["issuingauthority - policysynth", "issuing authority - policysynth"]);
        const idxLinkLicenses = this.findHeaderIdx(headers, ["link - licenses & permits", "link", "link - licences & permits"]);
        const idxLtGpt = this.findHeaderIdx(headers, ["licensetype - gpt4.5 deep search", "licensetype - gpt deep search"]);
        const idxAuthGpt = this.findHeaderIdx(headers, ["issuingauthority - gpt4.5 deep search"]);
        const idxLinkGpt = this.findHeaderIdx(headers, ["link - gpt4.5 deep search", "link - gpt deep search"]);
        const rows = [];
        for (const row of dataRows) {
            const jobTitle = this.safeGet(row, idxTitle);
            if (!jobTitle)
                continue; // skip empty
            const seedLicenses = [];
            // -- Policysynth (human) link -------------------------------------------------
            const licenseTypeHuman = this.safeGet(row, idxLtPolicysynth);
            const issuingAuthHuman = this.safeGet(row, idxAuthPolicysynth);
            const linkHuman = this.safeGet(row, idxLinkLicenses);
            if (licenseTypeHuman || linkHuman) {
                seedLicenses.push({
                    licenseType: licenseTypeHuman || "",
                    issuingAuthority: issuingAuthHuman || "",
                    link: linkHuman || "",
                });
            }
            // -- GPT‑4.5 deep‑search link -------------------------------------------------
            const licenseTypeGpt = this.safeGet(row, idxLtGpt);
            const issuingAuthGpt = this.safeGet(row, idxAuthGpt);
            const linkGpt = this.safeGet(row, idxLinkGpt);
            if (licenseTypeGpt || linkGpt) {
                seedLicenses.push({
                    licenseType: licenseTypeGpt || licenseTypeHuman || "",
                    issuingAuthority: issuingAuthGpt || issuingAuthHuman || "",
                    link: linkGpt || "",
                });
            }
            if (seedLicenses.length === 0)
                continue; // Nothing useful on this row
            rows.push({ jobTitle, seedLicenses });
        }
        return rows;
    }
    /** Locate any of the candidate header names, returns index or -1 */
    findHeaderIdx(headers, candidates) {
        for (const c of candidates) {
            const idx = headers.indexOf(c.toLowerCase());
            if (idx !== -1)
                return idx;
        }
        return -1;
    }
    safeGet(row, idx) {
        if (idx === -1 || idx >= row.length)
            return "";
        return (row[idx] ?? "").toString().trim();
    }
    /** Convert zero‑based column index to spreadsheet letter (0 → A, 25 → Z, 26 → AA) */
    columnIndexToLetter(index) {
        let temp = index;
        let letter = "";
        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }
        return letter;
    }
}
//# sourceMappingURL=importSheet.js.map