import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";

export class JobDescriptionPairExporter extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;
  private docsConnector: PsGoogleDocsConnector;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.docsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Document,
      false
    ) as PsGoogleDocsConnector;

    if (!this.docsConnector) {
      throw new Error("Google Docs connector not found");
    }
  }

  async exportPairs(): Promise<void> {
    await this.updateRangedProgress(0, "Starting Job Description Pair Export");

    const mem = this.memory as JobDescriptionMemoryData;
    let content = "Job Description Pair Export Report\n\n";
    content += `Total Job Descriptions Processed: ${mem.jobDescriptions.length}\n\n`;

    for (const jd of mem.jobDescriptions) {
      // Only include job descriptions that have a rewritten version.
      if (!jd.rewrittenText) continue;

      let category = "no classification";

      if (Array.isArray(jd.occupationalCategory) && jd.occupationalCategory.length > 0) {
        const mainCat = jd.occupationalCategory[0].mainCategory;
        // Ensure mainCategory is a non-empty string
        if (mainCat && mainCat.trim() !== "") {
          category = mainCat.toLowerCase();
        }
      }

      content += `Job Name: ${jd.name}\n`;
      content += `Title Code: ${jd.titleCode}\n`;
      content += `Category: ${category}\n\n`;
      // Add reading level meta data.
      if (jd.readingLevelGradeAnalysis) {
        content += `Reading Level: ${jd.readingLevelGradeAnalysis.readabilityLevel}\n`;
      } else if (jd.readabilityAnalysisTextTSNPM) {
        content += `Reading Level (Flesch-Kincaid Grade): ${jd.readabilityAnalysisTextTSNPM.fleschKincaidGrade}\n`;
      } else {
        content += "Reading Level: N/A\n";
      }

      // Add maximum education requirement meta data from degree analysis.
      if (jd.degreeAnalysis && jd.degreeAnalysis.maximumDegreeRequirement) {
        content += `Maximum Education Requirement: ${jd.degreeAnalysis.maximumDegreeRequirement}\n`;
      } else {
        content += "Maximum Education Requirement: N/A\n";
      }

      content += "\n--- Original Job Description ---\n";
      content += jd.text + "\n\n";

      content += "--- Rewritten Job Description ---\n";
      content += jd.rewrittenText + "\n";
      content += "---------------------------------------\n\n\n\n";
    }

    await this.docsConnector.updateDocument(content);
    await this.updateRangedProgress(100, "Job Description Pair Export completed");
  }
}
