import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector";

interface JobDescriptionInput {
  agentId: string;
  jobDescriptions: JobDescription[];
}

/**
 * Agent to read JSON data (similar to jobDescriptions.json) and push a flattened
 * version to Google Sheets with the same columns/structure as the CSV version.
 */
export class GoogleSheetsJobDescriptionAgent extends PolicySynthAgent {
  declare memory: any;
  private sheetsConnector: PsBaseSheetConnector;
  private sheetName = "Job Descriptions Analysis";  // Adjust to your target Sheet tab, if desired
  private readonly chunkSize = 500;       // Number of rows to send per update

  constructor(
    agent: PsAgent,
    memory: any,
    startProgress: number,
    endProgress: number,
    sheetName: string
  ) {
    super(agent, memory, startProgress, endProgress);

    // Initialize the Google Sheets connector
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      throw new Error("Google Sheets connector not found");
    }
    this.sheetName = sheetName;
  }

  /**
   * Main method to receive the JSON data and push it into Google Sheets in chunks.
   * The JSON shape is something like:
   * {
   *   "agentId": "someAgentId",
   *   "jobDescriptions": [ ... ]
   * }
   */
  async processJsonData(jsonData: JobDescriptionInput): Promise<void> {
    await this.updateRangedProgress(0, "Starting Google Sheets export");

    // Generate the 2D array (headers + rows) with identical structure to your CSV
    const fullData = this.generateSheetData(jsonData);

    // Convert all cells to strings (and JSON if object)
    const sanitizedData = this.sanitizeData(fullData);

    // Write in chunks so large data won't break the API
    await this.updateSheetInChunks(sanitizedData);

    await this.updateRangedProgress(100, "Google Sheets export completed");
  }

  /**
   * Creates the 2D array (rows) that will be pushed to the Google Sheet,
   * exactly matching the CSV columns and order from your script.
   */
  private generateSheetData(jsonData: JobDescriptionInput): string[][] {
    // Define the header row in the same order as your CSV
    const headers = [
      "agentId",
      "titleCode",
      "variant",
      "classOfService",
      "workWeek",
      "bargainUnit",
      "classCode",
      "salaryRange",
      "workMonth",
      "deptCode",
      "url",
      "name",
      // "text", // Uncomment if you need this field
      "classification",
      "error",
      "multiLevelJob",
      "cscRevised",
      "notes",
      // OccupationalCategory
      "occupationalCategory.mainCategory",
      "occupationalCategory.subCategory",
      // Degree Analysis
      "degreeAnalysis.needsCollegeDegree",
      // Education Requirements
      "degreeAnalysis.educationRequirements",
      // Degree Requirement Status
      "degreeAnalysis.degreeRequirementStatus.isDegreeMandatory",
      "degreeAnalysis.degreeRequirementStatus.hasAlternativeQualifications",
      "degreeAnalysis.degreeRequirementStatus.alternativeQualifications",
      "degreeAnalysis.degreeRequirementStatus.multipleQualificationPaths",
      "degreeAnalysis.degreeRequirementStatus.isDegreeAbsolutelyRequired",
      "degreeAnalysis.degreeRequirementStatus.substitutionPossible",
      // Mandatory Status Explanations
      "degreeAnalysis.mandatoryStatusExplanations.degreeRequirementExplanation",
      "degreeAnalysis.mandatoryStatusExplanations.bothTrueExplanation",
      "degreeAnalysis.mandatoryStatusExplanations.bothFalseExplanation",
      // Professional License Requirement
      "degreeAnalysis.professionalLicenseRequirement.isLicenseRequired",
      "degreeAnalysis.professionalLicenseRequirement.licenseDescription",
      "degreeAnalysis.professionalLicenseRequirement.issuingAuthority",
      "degreeAnalysis.professionalLicenseRequirement.includesDegreeRequirement",
      // Barriers
      "degreeAnalysis.barriersToNonDegreeApplicants",
      // Validation Checks (in reversed order per your script)
      "degreeAnalysis.validationChecks.cscRevisedConsistency",
      "degreeAnalysis.validationChecks.requiredAlternativeExplanationConsistency",
      "degreeAnalysis.validationChecks.barriersToNonDegreeApplicantsConsistency",
      "degreeAnalysis.validationChecks.licenseIncludesDegreeRequirementConsistency",
      "degreeAnalysis.validationChecks.alternativesIfTrueConsistency",
      "degreeAnalysis.validationChecks.degreeMandatoryConsistency",
      "degreeAnalysis.validationChecks.alternativeQualificationsConsistency",
      "degreeAnalysis.validationChecks.educationRequirementsConsistency",
      "degreeAnalysis.validationChecks.needsCollegeDegreeConsistency",
      // Reading Level US Grade Analysis
      "readingLevelUSGradeAnalysis.difficultPassages",
      "readingLevelUSGradeAnalysis.usGradeLevelReadability",
      // Reading Level US Grade Analysis P2
      "readingLevelUSGradeAnalysisP2.difficultPassages",
      "readingLevelUSGradeAnalysisP2.usGradeLevelReadability",
      // Reading Level Analysis Results
      "readingLevelAnalysisResults.difficultPassages",
      "readingLevelAnalysisResults.usGradeLevelReadability",
    ];

    // Start building our 2D array of data with headers as the first row
    const sheetData: string[][] = [headers];

    // If there's no jobDescriptions array, return just the header row
    if (!jsonData?.jobDescriptions) {
      return sheetData;
    }

    // For each job, build a row in the same order as headers
    jsonData.jobDescriptions.forEach((job: JobDescription) => {
      const row: string[] = [];

      row.push(this.safeString(jsonData.agentId));
      row.push(this.safeString(job.titleCode));
      row.push(this.safeString(job.variant));
      row.push(this.safeString(job.classOfService));
      row.push(this.safeString(job.workWeek));
      row.push(this.safeString(job.bargainUnit));
      row.push(this.safeString(job.classCode));
      row.push(this.safeString(job.salaryRange));
      row.push(this.safeString(job.workMonth));
      row.push(this.safeString(job.deptCode));
      row.push(this.safeString(job.url));
      row.push(this.safeString(job.name));
      // row.push(this.safeString(job.text)); // Uncomment if needed
      row.push(JSON.stringify(job.classification) || "");
      row.push(this.safeString(job.error));
      row.push(String(job.multiLevelJob ?? ""));
      row.push(this.safeString(job.cscRevised));
      row.push(this.safeString(job.notes));

      if (job.occupationalCategory) {
        // Column: main category
        row.push(this.safeString(job.occupationalCategory.mainCategory));

        // Column: all subCategories, joined with a delimiter
        const allSubs = job.occupationalCategory.subCategories
          ? job.occupationalCategory.subCategories
              .map((sc) => sc.subCategory)
              .join(", ")
          : "";
        row.push(allSubs);
      } else {
        row.push("", "");
      }

      // degreeAnalysis
      const da = job.degreeAnalysis || {};
      row.push(String(da.needsCollegeDegree ?? ""));

      // educationRequirements
      if (da.educationRequirements && Array.isArray(da.educationRequirements)) {
        const eduReqs = da.educationRequirements
          .map((req: any) => `${req.type}: ${req.evidenceQuote}`)
          .join("\r\n|\r\n");
        row.push(eduReqs);
      } else {
        row.push("");
      }

      // degreeRequirementStatus
      const drs = da.degreeRequirementStatus || {};
      row.push(String(drs.isDegreeMandatory ?? ""));
      row.push(String(drs.hasAlternativeQualifications ?? ""));
      row.push(
        drs.alternativeQualifications
          ? drs.alternativeQualifications.join("\r\n|\r\n")
          : ""
      );
      row.push(String(drs.multipleQualificationPaths ?? ""));
      row.push(String(drs.isDegreeAbsolutelyRequired ?? ""));
      row.push(String(drs.substitutionPossible ?? ""));

      // mandatoryStatusExplanations
      const mse = da.mandatoryStatusExplanations || {};
      row.push(this.safeString(mse.degreeRequirementExplanation));
      row.push(this.safeString(mse.bothTrueExplanation));
      row.push(this.safeString(mse.bothFalseExplanation));

      // professionalLicenseRequirement
      const plr = da.professionalLicenseRequirement!;
      row.push(String(plr.isLicenseRequired ?? ""));
      row.push(this.safeString(plr.licenseDescription));
      row.push(this.safeString(plr.issuingAuthority));
      row.push(String(plr.includesDegreeRequirement ?? ""));

      // barriersToNonDegreeApplicants
      row.push(this.safeString(da.barriersToNonDegreeApplicants));

      // validationChecks in reversed order
      const vc = da.validationChecks || {};
      row.push(String(vc.cscRevisedConsistency ?? ""));
      row.push(String(vc.requiredAlternativeExplanationConsistency ?? ""));
      row.push(String(vc.barriersToNonDegreeApplicantsConsistency ?? ""));
      row.push(String(vc.licenseIncludesDegreeRequirementConsistency ?? ""));
      row.push(String(vc.alternativesIfTrueConsistency ?? ""));
      row.push(String(vc.degreeMandatoryConsistency ?? ""));
      row.push(String(vc.alternativeQualificationsConsistency ?? ""));
      row.push(String(vc.educationRequirementsConsistency ?? ""));
      row.push(String(vc.needsCollegeDegreeConsistency ?? ""));

      // readingLevelUSGradeAnalysis
      const rlu = job.readingLevelUSGradeAnalysis!;
      row.push(
        Array.isArray(rlu.difficultPassages)
          ? rlu.difficultPassages.join("\r\n|\r\n")
          : ""
      );
      row.push(this.safeString(rlu.usGradeLevelReadability));

      // readingLevelUSGradeAnalysisP2
      const rlu2 = job.readingLevelUSGradeAnalysisP2!;
      row.push(
        Array.isArray(rlu2.difficultPassages)
          ? rlu2.difficultPassages.join("\r\n|\r\n")
          : ""
      );
      row.push(this.safeString(rlu2.usGradeLevelReadability));

      // readingLevelAnalysisResults
      const rlar = job.readingLevelUSGradeAnalysis!;
      row.push(
        Array.isArray(rlar.difficultPassages)
          ? rlar.difficultPassages.join("\r\n|\r\n")
          : ""
      );
      row.push(this.safeString(rlar.usGradeLevelReadability));

      // Add this row to our 2D array
      sheetData.push(row);
    });

    return sheetData;
  }

  /**
   * Breaks the 2D array into chunks of `this.chunkSize` and updates the sheet range by range.
   */
  private async updateSheetInChunks(allRows: string[][]): Promise<void> {
    // For convenience, let's figure out the total columns from the header row
    if (allRows.length === 0) return;
    const totalCols = allRows[0].length;

    // Start at row 1 in the sheet
    let rowPointer = 1;

    // We do one chunk at a time
    for (let i = 0; i < allRows.length; i += this.chunkSize) {
      // Slicing out chunk
      const chunk = allRows.slice(i, i + this.chunkSize);
      // The chunk might have chunk.length rows
      const chunkLength = chunk.length;
      // The end row in the sheet for this chunk
      const startRow = rowPointer;
      const endRow = rowPointer + chunkLength - 1;

      // Convert column count to a letter range for the end column, e.g. "Z", "AA", etc.
      const endColLetter = this.columnIndexToLetter(totalCols - 1);

      // e.g. "Sheet1!A1:Z500"
      const range = `${this.sheetName}!A${startRow}:${endColLetter}${endRow}`;

      // Update the chunk into the specified range
      await this.sheetsConnector.updateRange(range, chunk);

      // Advance the row pointer
      rowPointer += chunkLength;
    }
  }

  /**
   * Converts a zero-based column index to a spreadsheet column letter (e.g. 0 -> "A", 25 -> "Z", 26 -> "AA").
   */
  private columnIndexToLetter(index: number): string {
    let temp = index;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  /**
   * Makes sure values are strings (or for objects, uses JSON) to mirror CSV export style.
   */
  private sanitizeData(data: any[][]): string[][] {
    return data.map((row) =>
      row.map((cell) => {
        if (typeof cell === "object" && cell !== null) {
          return JSON.stringify(cell);
        }
        return cell === undefined || cell === null ? "" : String(cell);
      })
    );
  }

  /**
   * Utility to handle null/undefined and return an empty string if so.
   */
  private safeString(value: any): string {
    return value !== null && value !== undefined ? String(value) : "";
  }
}
