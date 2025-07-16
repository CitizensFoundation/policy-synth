import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { EducationType } from "../jobDescriptions/educationTypes.js";

import { SheetsEducationRequirementExportAgent } from "./educationExportSheet.js";
import { JobTitleDeepResearchAgent } from "./jobTitleDeepResearch.js";
import { ProcessAndScanStatuesAgent } from "./processAndScanStatuesAgent.js";
import pLimit from "p-limit";

export class EducationRequirementsBarrierDeepResearchAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_BASE_ID = "7eb4d482-1fcb-400c-a877-070305c9b661";
  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_VERSION = 2;

  constructor(agent: PsAgent, memory: JobDescriptionMemoryData, start: number, end: number) {
    super(agent, memory, start, end);
    this.memory = memory;
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting education requirement deep research");

    const qualifyingJobs = (this.memory.jobDescriptions || []).filter((j) => {
      const maxReq = j.degreeAnalysis?.maximumDegreeRequirement;
      return (
        j.degreeAnalysis?.needsCollegeDegree &&
        (maxReq === EducationType.BachelorsDegree || maxReq === EducationType.AssociatesDegree)
      );
    });

    const results: EducationRequirementResearchResult[] = [];
    const statutesAgent = new ProcessAndScanStatuesAgent(this.agent, this.memory);
    await statutesAgent.loadAndScanStatuesIfNeeded();
    const limit = pLimit(5);
    let processed = 0;
    const tasks = qualifyingJobs.map((job) =>
      limit(async () => {
        const researcher = new JobTitleDeepResearchAgent(this.agent, this.memory, 0, 100);
        const row = (await researcher.doWebResearch(job.name, {
          numberOfQueriesToGenerate: 3,
          percentOfQueriesToSearch: 0.2,
          percentOfResultsToScan: 0.2,
          maxTopContentResultsToUse: 3,
        })) as EducationRequirementResearchResult[];

        await statutesAgent.analyseJob(job.name);
        results.push(...row);
        processed++;
        await this.updateRangedProgress(
          Math.floor((processed / qualifyingJobs.length) * 90),
          `Research ${job.name}`
        );
      })
    );

    await Promise.all(tasks);

    const exporter = new SheetsEducationRequirementExportAgent(
      this.agent,
      this.memory,
      95,
      100,
      "Sheet1"
    );
    await exporter.processJsonData(results);
    await this.updateRangedProgress(100, "Completed education requirement research");
  }

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.EDUCATION_DEEP_RESEARCH_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Education Requirements Barrier Deep Research Agent",
      version: this.EDUCATION_DEEP_RESEARCH_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        category: PsAgentClassCategories.HRManagement,
        subCategory: "legalResearch",
        hasPublicAccess: false,
        description:
          "Research official sources supporting college degree requirements for job titles",
        queueName: "EDUCATION_REQUIREMENTS_DEEP_RESEARCH",
        imageUrl:
          "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6ee8390b-7a66-4692-baf0-f74c394004c0.png",
        iconName: "education_requirements_deep_research",
        capabilities: ["analysis", "text processing"],
        requestedAiModelSizes: [PsAiModelSize.Small, PsAiModelSize.Medium, PsAiModelSize.Large],
        supportedConnectors: [] as PsConnectorClassTypes[],
        questions: [],
      },
    };
  }
}
