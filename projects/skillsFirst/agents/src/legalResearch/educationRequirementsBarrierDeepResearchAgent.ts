import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { EducationType } from "../jobDescriptions/educationTypes.js";

import { SheetsEducationRequirementExportAgent } from "./educationExportSheet.js";

import { ProcessAndScanStatuesAgent } from "./processAndScanStatuesAgent.js";
import pLimit from "p-limit";
import { JobTitleDeepResearchAgent } from "./jobTitleDeepResearch.js";

export class EducationRequirementsBarrierDeepResearchAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_BASE_ID = "7eb4d482-1fcb-400c-a877-070305c9b661";
  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_VERSION = 2;

  override get maxModelTokensOut(): number {
    return 30000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  constructor(agent: PsAgent, memory: JobDescriptionMemoryData, start: number, end: number) {
    super(agent, memory, start, end);
    this.memory = memory;
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting education requirement deep research");

    let qualifyingJobs = (this.memory.jobDescriptions || []).filter((j) => {
      const maxReq = j.degreeAnalysis?.maximumDegreeRequirement;
      return (
        j.degreeAnalysis?.needsCollegeDegree &&
        (maxReq === EducationType.BachelorsDegree || maxReq === EducationType.AssociatesDegree)
      );
    });

    qualifyingJobs = qualifyingJobs.slice(0, 5);

    console.log(`---------------------> Found ${qualifyingJobs.length} qualifying jobs`);

    const results: EducationRequirementResearchResult[] = [];
    const statutesAgent = new ProcessAndScanStatuesAgent(this.agent, this.memory);
    await statutesAgent.loadAndScanStatuesIfNeeded();
    const limit = pLimit(1);
    let processed = 0;
    const tasks = qualifyingJobs.map((job) =>
      limit(async () => {
        const webResearchCfg: any = {
          numberOfQueriesToGenerate: 4,
          percentOfQueriesToSearch: 0.5,
          percentOfResultsToScan: 0.5,
          maxTopContentResultsToUse: 5,
          maxItemsToAnalyze: 5,
        };

        const researcher = new JobTitleDeepResearchAgent(
          this.agent,
          this.memory,
          this.startProgress,
          this.endProgress
        );

        await researcher.updateRangedProgress(
          0,
          `Scanning statutes for ${job.name}`
        );

        const { results: statuteResults } = { results: [] };
        //  await statutesAgent.analyseJob(job.name);


        await researcher.updateRangedProgress(
          0,
          `Deep researching for ${job.name}`
        );

        const deepResearchResults = (await researcher.doWebResearch(job.name, {
          ...webResearchCfg
        })) as EducationRequirementResearchResult[];

        console.log(`---------------------> Deep research results: ${JSON.stringify(deepResearchResults)}`);

        if (deepResearchResults.length > 0) {
          results.push(...deepResearchResults);
          job.degreeAnalysis.deepResearchResults =
            job.degreeAnalysis.deepResearchResults || [];
          job.degreeAnalysis.deepResearchResults.push(
            ...deepResearchResults,
          );
        }

        if (statuteResults.length > 0) {
          results.push(...statuteResults);
          job.degreeAnalysis.statutesResearchResults =
            job.degreeAnalysis.statutesResearchResults || [];
          job.degreeAnalysis.statutesResearchResults.push(...statuteResults);
        }

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

    console.log(`---------------------> Results to export: ${JSON.stringify(results)}`);

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
