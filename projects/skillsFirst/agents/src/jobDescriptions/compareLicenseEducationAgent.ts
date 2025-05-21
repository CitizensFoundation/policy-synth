import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import stringSimilarity from "string-similarity";
import { SheetsLicenseEducationImportAgent } from "./imports/sheetsLicenseEducationImport.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import type { PsAgentClassCreationAttributes } from "@policysynth/agents/dbModels/agentClass.js";

/**
 * Agent that compares license education requirements across two worksheets.
 *
 * Configure **two** Google Sheet connectors ("Sheet1" and "Sheet2") in the
 * Policy Synth UI, or point a single connector at different worksheets.  The
 * optional `memory.sheet1Name` and `memory.sheet2Name` values allow overriding
 * the worksheet/tab names.  Results may be exported to another worksheet using
 * {@link SheetsLicenseEducationExportAgent}.  Set the output sheet name when
 * constructing that exporter or via its own memory field.
 */
export class CompareLicenseEducationAgent extends PolicySynthAgent {
  declare memory: LicenseEducationComparisonMemory;

  private static readonly CLASS_BASE_ID = "c9d62559-education-compare";
  private static readonly CLASS_VERSION = 1;

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.CLASS_BASE_ID,
      user_id: 0,
      name: "License Education Comparison Agent",
      version: this.CLASS_VERSION,
      available: true,
      configuration: {
        category: PsAgentClassCategories.DataAnalysis,
        subCategory: "licenseEducationComparison",
        hasPublicAccess: false,
        description:
          "Compares license education requirements across two sheets",
        queueName: "LICENSE_EDUCATION_COMPARISON",
      },
    };
  }

  /**
   * Entry point used by the queue processor.  You may optionally set
   * `memory.sheet1Name` and `memory.sheet2Name` to override the worksheet
   * names used for input.
   */
  async process(): Promise<void> {
    const sheet1 = (this.memory as any).sheet1Name ?? "Sheet1";
    const sheet2 = (this.memory as any).sheet2Name ?? "Sheet2";
    await this.compare(sheet1, sheet2);
  }

  async compare(sheet1Name = "Sheet1", sheet2Name = "Sheet2"): Promise<void> {
    const importer1 = new SheetsLicenseEducationImportAgent(
      this.agent,
      this.memory,
      0,
      10,
      sheet1Name
    );
    const importer2 = new SheetsLicenseEducationImportAgent(
      this.agent,
      this.memory,
      10,
      20,
      sheet2Name
    );

    const sheet1Rows = await importer1.importRows();
    const sheet2Rows = await importer2.importRows();

    this.memory.sheet1Rows = sheet1Rows;
    this.memory.sheet2Rows = sheet2Rows;
    this.memory.comparisons = [];

    for (const row1 of sheet1Rows) {
      const candidates = this.selectCandidates(row1, sheet2Rows);
      const comparison = await this.compareRowWithCandidates(row1, candidates);
      this.memory.comparisons.push(comparison);
    }
  }

  /** Find sheet2 rows with fuzzy match on licenseType */
  private selectCandidates(
    row: LicenseEducationRow,
    sheet2: LicenseEducationRow[]
  ): LicenseEducationRow[] {
    if (!sheet2.length) return [];
    const scores = sheet2.map((r) => ({
      row: r,
      rating: stringSimilarity.compareTwoStrings(
        (row.licenseType || "").toLowerCase(),
        (r.licenseType || "").toLowerCase()
      ),
    }));
    const threshold = 0.6;
    return scores
      .filter((s) => s.rating >= threshold)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((s) => s.row);
  }

  private async compareRowWithCandidates(
    row1: LicenseEducationRow,
    candidates: LicenseEducationRow[]
  ): Promise<LicenseEducationComparison> {
    const systemPrompt = `You are an expert at matching license education requirements.\n` +
      `We have one row from Sheet1 and several candidate rows from Sheet2.\n` +
      `Decide if the Sheet1 row matches any candidate.\n` +
      `Sheet1 Row: ${JSON.stringify(row1)}\n` +
      `Candidate Rows: ${JSON.stringify(candidates)}\n` +
      `Respond only with JSON in this format:` +
      `{"matchedLicenseType2":"","eduReq2":"","matchConfidence":0,"explanation":""}`;

    const messages = [this.createSystemMessage(systemPrompt)];
    const result = (await this.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Large,
      messages
    )) as LicenseEducationComparison;

    return {
      licenseType1: row1.licenseType,
      eduReq1: row1.educationRequirement,
      matchedLicenseType2: result?.matchedLicenseType2,
      eduReq2: result?.eduReq2,
      matchConfidence: result?.matchConfidence ?? 0,
      explanation: result?.explanation ?? "",
    };
  }
}
