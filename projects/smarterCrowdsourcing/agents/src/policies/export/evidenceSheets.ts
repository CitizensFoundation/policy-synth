import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";

export class PoliciesSheetsExportAgent extends PolicySynthAgent {
  private sheetsConnector: PsBaseSheetConnector;

  declare memory: PsSmarterCrowdsourcingMemoryData;

  constructor(
    agent: PsAgent,
    memory: PsSmarterCrowdsourcingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      console.error("Google Sheets connector not found");
      throw new Error("Google Sheets connector not found");
    }
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting policies export");

    const subProblems: PsSubProblem[] = this.memory.subProblems;
    if (!subProblems || subProblems.length === 0) {
      throw new Error("No subproblems found in memory.");
    }

    let totalPolicies = 0;
    for (let i = 0; i < subProblems.length; i++) {
      const subProblem = subProblems[i];

      // Get the initial population of policies
      const policiesPopulation = subProblem.policies?.populations[0];
      if (!policiesPopulation || policiesPopulation.length === 0) {
        console.warn(`No policies found for subproblem: ${subProblem.title}`);
        continue;
      }

      totalPolicies += policiesPopulation.length;

      for (let j = 0; j < policiesPopulation.length; j++) {
        const policy = policiesPopulation[j];

        // Prepare data for export
        const data = this.preparePolicyEvidenceData(policy);

        const sheetName = this.sanitizeSheetName(
          `Solution_${policy.title.substring(0, 50)}`
        );

        // Ensure the sheet exists (create if it doesn't)
        await this.sheetsConnector.addSheetIfNotExists(sheetName);

        // Write data to the sheet starting from A1
        await this.sheetsConnector.updateRange(`${sheetName}!A1`, data);

        console.log(
          `Exported evidence for policy: ${policy.title} to sheet: ${sheetName}`
        );

        // Update progress
        const progressPercentage = ((j + 1) / policiesPopulation.length) * 100;
        await this.updateRangedProgress(
          progressPercentage,
          `Processed policy ${j + 1}/${
            policiesPopulation.length
          } in subproblem ${i + 1}/${subProblems.length}`
        );
      }
    }

    await this.updateRangedProgress(100, "Policies export completed");
    console.log(`Total policies exported: ${totalPolicies}`);
  }

  /**
   * Sanitizes sheet names by removing or replacing invalid characters.
   * @param name The original sheet name.
   * @returns A sanitized sheet name.
   */
  private sanitizeSheetName(name: string): string {
    return name.replace(/[/\\?*[\]]/g, "_").substring(0, 100);
  }

  /**
   * Prepares the data for exporting a policy's webEvidence.
   * @param policy The policy whose evidence to prepare.
   * @returns A 2D array representing rows and columns for Google Sheets.
   */
  private preparePolicyEvidenceData(policy: PSPolicy): string[][] {
    const headers = [
      "Evidence URL",
      "Summary",
      "Most Relevant Paragraphs",
      "Relevance to Policy Proposal",
      "Most Important Policy Evidence in Text Context",
      "Pros for Policy Found in Text Context",
      "Cons for Policy Found in Text Context",
      "What Policy Needs to Implement in Response to Evidence",
      "Risks for Policy",
      "Evidence Academic Sources",
      "Evidence Organization Sources",
      "Evidence Human Sources",
      "Confidence Score",
      "Relevance to Type Score",
      "Relevance Score",
      "Quality Score",
      "Total Score",
      "Content Publishing Year",
      "Evidence Type",
      // Add other fields as needed
    ];

    const rows: string[][] = [];

    if (!policy.webEvidence || policy.webEvidence.length === 0) {
      console.warn(`No webEvidence found for policy: ${policy.title}`);
      // Optionally, you can return an empty data array or add a row indicating no evidence.
      rows.push(["No web evidence found for this policy."]);
    } else {
      policy.webEvidence.forEach((evidence) => {
        if (
          evidence.contentPublishingYear &&
          evidence.contentPublishingYear >= 2022 &&
          evidence.relevanceScore > 70 &&
          evidence.qualityScore > 70
        ) {
          rows.push([
            evidence.url || "",
            evidence.summary || "",
            evidence.mostRelevantParagraphs
              ? evidence.mostRelevantParagraphs.join("\n")
              : "",
            evidence.relevanceToPolicyProposal || "",
            evidence.mostImportantPolicyEvidenceInTextContext
              ? evidence.mostImportantPolicyEvidenceInTextContext.join("\n")
              : "",
            evidence.prosForPolicyFoundInTextContext
              ? evidence.prosForPolicyFoundInTextContext.join("\n")
              : "",
            evidence.consForPolicyFoundInTextContext
              ? evidence.consForPolicyFoundInTextContext.join("\n")
              : "",
            evidence.whatPolicyNeedsToImplementInResponseToEvidence
              ? evidence.whatPolicyNeedsToImplementInResponseToEvidence.join(
                  "\n"
                )
              : "",
            evidence.risksForPolicy ? evidence.risksForPolicy.join("\n") : "",
            evidence.evidenceAcademicSources
              ? evidence.evidenceAcademicSources.join("\n")
              : "",
            evidence.evidenceOrganizationSources
              ? evidence.evidenceOrganizationSources.join("\n")
              : "",
            evidence.evidenceHumanSources
              ? evidence.evidenceHumanSources.join("\n")
              : "",
            evidence.confidenceScore?.toString() || "",
            evidence.relevanceToTypeScore?.toString() || "",
            evidence.relevanceScore?.toString() || "",
            evidence.qualityScore?.toString() || "",
            evidence.totalScore?.toString() || "",
            evidence.contentPublishingYear?.toString() || "",
            evidence.type || "",
          ]);
        } else {
          console.warn(
            `Evidence not included in export due to low scores or missing data: ${evidence.url}`
        }
      });
    }

    // Optionally, include policy details at the top of the sheet
    const policyDetails = [
      ["Policy Title:", policy.title || ""],
      ["Policy Description:", policy.description || ""],
      [], // Empty row before headers
    ];

    return [...policyDetails, headers, ...rows];
  }
}
