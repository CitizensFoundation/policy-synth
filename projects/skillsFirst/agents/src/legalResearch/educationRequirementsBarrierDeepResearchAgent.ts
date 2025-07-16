import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { EducationType } from "../jobDescriptions/educationTypes.js";

import { SheetsEducationRequirementExportAgent } from "./educationExportSheet.js";
import { JobTitleAuthoritativeSourceFinderAgent } from "./jobTitleAuthoritativeSourceFinder.js";
import { EducationRequirementAnalyzerAgent } from "./educationRequirementAnalyzer.js";
import {
  FirecrawlScrapeAndCrawlerAgent,
  ScrapedPage,
} from "../jobDescriptions/licenceDegrees/firecrawlExtractor.js";
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
    const limit = pLimit(1);
    let processed = 0;
    const tasks = qualifyingJobs.map((job) =>
      limit(async () => {
        const finder = new JobTitleAuthoritativeSourceFinderAgent(
          this.agent,
          this.memory,
          0,
          100
        );
        const urls = await finder.findSources(job.name);
        const { results: statuteResults, educationRequirementResults } = await statutesAgent.analyseJob(job.name);

        if (educationRequirementResults.length > 0) {
          results.push(...educationRequirementResults);
        }

        const finalUrls = Array.from(new Set(urls)).slice(0, 3);
        for (const src of finalUrls) {
          let pagesToAnalyze: ScrapedPage[] = [];
          if (src) {
            const extractor = new FirecrawlScrapeAndCrawlerAgent(
              this.agent,
              this.memory,
              0,
              100,
              job.name
            );
            pagesToAnalyze = await extractor.scrapeUrl(
              src,
              ["markdown"],
              3,
              true
            );
          }

          for (const page of pagesToAnalyze) {
            const analyzer = new EducationRequirementAnalyzerAgent(
              this.agent,
              this.memory,
              0,
              100
            );
            const res = (await analyzer.analyze(
              page.content,
              job.name,
              page.url
            )) as EducationRequirementResearchResult;

            res.jobTitle = job.name;
            res.sourceUrl = page.url;
            if (!("error" in res)) {
              results.push(res);
            }
          }
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
