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
import fs from "fs";
import csv from "csv-parser";

export class EducationRequirementsBarrierDeepResearchAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_BASE_ID =
    "7eb4d482-1fcb-400c-a877-070305c9b661";
  static readonly EDUCATION_DEEP_RESEARCH_AGENT_CLASS_VERSION = 2;

  override get maxModelTokensOut(): number {
    return 30000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    start: number,
    end: number
  ) {
    super(agent, memory, start, end);
    this.memory = memory;
  }

  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(
      0,
      "Starting education requirement deep research"
    );

    this.ensureCsvHeaderIfNeeded();

    // Read processed title codes from CSV to allow resuming without reprocessing
    const processedTitleCodes = await this.readProcessedTitleCodesFromCsv();

    let qualifyingJobs = (this.memory.jobDescriptions || []).filter((j) => {
      const maxReq = j.degreeAnalysis?.maximumDegreeRequirement;
      return (
        j.degreeAnalysis?.needsCollegeDegree &&
        (maxReq === EducationType.BachelorsDegree ||
          maxReq === EducationType.AssociatesDegree)
      );
    });

    // Skip jobs whose titleCode is already present in the CSV
    if (processedTitleCodes.size > 0) {
      const before = qualifyingJobs.length;
      qualifyingJobs = qualifyingJobs.filter((j) => !processedTitleCodes.has(j.titleCode));
      const after = qualifyingJobs.length;
      console.log(`---------------------> Skipping ${before - after} already-processed jobs based on CSV`);
    }

//    qualifyingJobs = this.shuffleArray(qualifyingJobs).slice(0, 4);

    (this.memory as any).jobLicenceTypesForLicenceAnalysis = [];

    await this.saveMemory();

    console.log(
      `---------------------> Found ${qualifyingJobs.length} qualifying jobs`
    );

    const results: EducationRequirementResearchResult[] = [];
    const statutesAgent = new ProcessAndScanStatuesAgent(
      this.agent,
      this.memory
    );
    await statutesAgent.loadAndScanStatuesIfNeeded();
    const limit = pLimit(1);
    let processed = 0;
    const tasks = qualifyingJobs.map((job) =>
      limit(async () => {
        const webResearchCfg: any = {
          numberOfQueriesToGenerate: 18,
          percentOfQueriesToSearch: 0.55,
          percentOfResultsToScan: 0.55,
          maxTopContentResultsToUse: 1000,
          maxItemsToAnalyze: 1000,
        };

        //        job.degreeAnalysis.statutesResearchResults = [];
        job.degreeAnalysis.deepResearchResults = [];

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

        const statuteResults: EducationRequirementResearchResult[] =
          []; /*await statutesAgent.analyseJob(
          job.name
        );*/

        await researcher.updateRangedProgress(
          0,
          `Deep researching for ${job.name}`
        );

        let cleanedJobTitle = job.name.replace(/Confidential/g, "");
        cleanedJobTitle = cleanedJobTitle.replace(/confidential/g, "").trim();

        // Remove any numbers from the job title
        cleanedJobTitle = cleanedJobTitle.replace(/\d+/g, "").trim();

        const deepResearchResults: EducationRequirementResearchResult[] =
          (await researcher.doWebResearch(cleanedJobTitle, job.name, job.titleCode, {
            ...webResearchCfg,
          })) as EducationRequirementResearchResult[];

        console.log(
          `---------------------> Deep research results: ${JSON.stringify(
            deepResearchResults
          )}`
        );

        if (deepResearchResults.length > 0) {
          results.push(...deepResearchResults);
          job.degreeAnalysis.deepResearchResults =
            job.degreeAnalysis.deepResearchResults || [];
          job.degreeAnalysis.deepResearchResults.push(...deepResearchResults);
          this.appendResultsToCsv(deepResearchResults);
        }

        if (statuteResults.length > 0) {
          results.push(...statuteResults);
          job.degreeAnalysis.statutesResearchResults =
            job.degreeAnalysis.statutesResearchResults || [];
          job.degreeAnalysis.statutesResearchResults.push(...statuteResults);
          this.appendResultsToCsv(statuteResults);
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

    console.log(
      `---------------------> Results to export: ${JSON.stringify(results)}`
    );

    await exporter.processJsonData(results);
    await this.updateRangedProgress(
      100,
      "Completed education requirement research"
    );
  }

  static readonly CSV_PATH = "/home/robert/legalResearchImportProcess.csv";

  private ensureCsvHeaderIfNeeded(): void {
    try {
      const csvPath = EducationRequirementsBarrierDeepResearchAgent.CSV_PATH;
      let needsHeader = true;
      if (fs.existsSync(csvPath)) {
        const stats = fs.statSync(csvPath);
        needsHeader = stats.size === 0;
      }
      if (needsHeader) {
        const headers = [
          "titleCode",
          "jobTitle",
          "sourceUrl",
          "title",
          "statedDegreeRequirement",
          "degreeRequirementType",
          "typeOfOfficialDocument",
          "matchTypeForJobTitle",
          "typeOfDegreeRequirement",
          "mandatoryDegreeRequirementStatus",
          "reasoning",
          "error",
        ];
        fs.appendFileSync(csvPath, headers.join(",") + "\n");
      }
    } catch (err) {
      // Non-fatal: continue processing even if CSV header init fails
      console.error("Failed to initialize CSV header:", err);
    }
  }

  private csvEscape(value: unknown): string {
    const str = value === undefined || value === null ? "" : String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private appendResultsToCsv(results: EducationRequirementResearchResult[]): void {
    this.logger.info(`Appending ${results.length} results to CSV`);
    try {
      const csvPath = EducationRequirementsBarrierDeepResearchAgent.CSV_PATH;
      const lines = results.map((r) => {
        const row = [
          r.titleCode,
          r.jobTitle,
          r.sourceUrl,
          (r as any).title || "",
          r.statedDegreeRequirement,
          r.degreeRequirementType,
          r.typeOfOfficialDocument,
          r.matchTypeForJobTitle,
          r.typeOfDegreeRequirement,
          r.mandatoryDegreeRequirementStatus,
          r.reasoning,
          r.error || "",
        ];
        return row.map((v) => this.csvEscape(v)).join(",");
      });
      if (lines.length > 0) {
        this.logger.info(`Appending ${lines.length} lines to CSV with path ${csvPath}`);
        fs.appendFileSync(csvPath, lines.join("\n") + "\n");
      }
    } catch (err) {
      // Non-fatal: continue processing even if CSV append fails
      console.error("Failed to append to CSV:", err);
    }
  }

  private async readProcessedTitleCodesFromCsv(): Promise<Set<string>> {
    const csvPath = EducationRequirementsBarrierDeepResearchAgent.CSV_PATH;
    const processed = new Set<string>();
    try {
      if (!fs.existsSync(csvPath)) {
        return processed;
      }
      await new Promise<void>((resolve, reject) => {
        try {
          const stream = fs.createReadStream(csvPath)
            .pipe(csv())
            .on("data", (row: any) => {
              const titleCode = (row && (row.titleCode || row["titleCode"])) as string | undefined;
              if (titleCode) {
                processed.add(String(titleCode));
              }
            })
            .on("end", () => resolve())
            .on("error", (err: any) => reject(err));
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      console.error("Failed to read processed title codes from CSV:", err);
    }
    return processed;
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
        requestedAiModelSizes: [
          PsAiModelSize.Small,
          PsAiModelSize.Medium,
          PsAiModelSize.Large,
        ],
        supportedConnectors: [] as PsConnectorClassTypes[],
        questions: [],
      },
    };
  }
}
