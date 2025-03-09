// jobDescriptionMultiLevelAnalysisAgent.ts

import { JobDescriptionAnalysisAgent } from "../analysisAgent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { SheetsJobDescriptionExportAgent } from "../exports/sheetsExport.js";
import { SplitMultiLevelJobDescriptionAgent } from "./splitMultiLevelAgent.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * A specialized subclass that handles multi-level job descriptions.
 * If a JobDescription has .multiLevelJob = true, then we:
 *  1) Use a new sub-agent to split that JobDescription into multiple sub-levels,
 *     returning an array of new JobDescription objects (one per level).
 *  2) For each sub-level, we run the same chain of analysis sub-agents as in the parent class.
 *  3) We add those new sub-level JobDescriptions to memory.
 *  4) We export only those sub-level JobDescriptions to Google Sheets.
 */
export class JobDescriptionMultiLevelAnalysisAgent extends PolicySynthAgent {
  private analysisAgent: JobDescriptionAnalysisAgent;
  declare memory: JobDescriptionMemoryData;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number,
    analysisAgent: JobDescriptionAnalysisAgent
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.analysisAgent = analysisAgent;
  }

  private updateMultiLevelJobDataFromJson(): void {
    try {
      this.logger.info(
        "Updating multi-level job data from JSON file: jobDescriptionsWithNewMultiLevelJob.json"
      );
      const filePath = path.join(
        __dirname,
        "data",
        "jobDescriptionsWithNewMultiLevelJob.json"
      );

      if (!fs.existsSync(filePath)) {
        this.logger.warn(
          "No jobDescriptionsWithNewMultiLevelJob.json file found. Skipping multi-level job updates."
        );
        return;
      }

      // Parse the file
      const jsonString = fs.readFileSync(filePath, "utf-8");
      const updatedRecords: JobDescription[] = JSON.parse(jsonString);

      let counter = 0;

      // Loop through each record in the new data
      updatedRecords.forEach((record) => {
        // Find the matching job description in memory
        const existing = this.memory.jobDescriptions.find(
          (jd) =>
            jd.titleCode === record.titleCode && jd.variant === record.variant
        );

        // If we found a match, update its .multiLevelJob field
        if (existing) {
          existing.multiLevelJob = record.multiLevelJob;
          this.logger.info(
            `Updated multiLevelJob for ${existing.titleCode} (${existing.variant}) to: ${record.multiLevelJob}`
          );
          counter++;
        } else {
          // Optional: Log or handle any records not found in memory
          this.logger.warn(
            `No matching job description found in memory for titleCode: ${record.titleCode}, variant: ${record.variant}`
          );
        }
      });
      this.logger.info(`Updated ${counter} multi-level job descriptions`);
    } catch (err) {
      this.logger.error(
        "Error updating multi-level job data from JSON file:",
        err
      );
    }
  }

  /**
   * Main process method override that first checks for multi-level job descriptions,
   * splits them, runs the analysis for each level, and then exports those newly created
   * sub-level descriptions to Google Sheets.
   */
  override async process() {
    await this.updateRangedProgress(
      0,
      "Starting Multi-Level Job Description Analysis"
    );
    this.logger.info("Starting Multi-Level Job Description Analysis");

    this.updateMultiLevelJobDataFromJson();

    // Filter out the multi-level job descriptions
    const multiLevelDescriptions = this.memory.jobDescriptions.filter(
      (jd) => jd.multiLevelJob === true
    );

    // If none are multi-level, we can either do nothing or just run normal parent logic
    if (multiLevelDescriptions.length === 0) {
      this.logger.info("No multi-level job descriptions found. Exiting.");
      await this.updateRangedProgress(100, "No multi-level jobs found. Done.");
      return;
    }

    this.logger.info(
      `Found ${multiLevelDescriptions.length} multi-level job descriptions`
    );

    const newSubLevelDescriptions: JobDescription[] = [];

    const useMaxCounter = true;

    let counter = 1;
    let skipCounter = 0;

    // For each multi-level job, split it, then process the resulting sub-levels
    for (const multiLevelJD of multiLevelDescriptions) {
      if (useMaxCounter && counter > 15) {
        this.logger.info(
          `Processed ${counter} multi-level job descriptions. Exiting.`
        );
        break;
      }

      if (
        this.memory.doNotReprocessTitleCodes?.includes(multiLevelJD.titleCode)
      ) {
        this.logger.info(
          `Skipping ${multiLevelJD.titleCode} because it is in the doNotReprocessTitleCodes list`
        );
        skipCounter++;
        continue;
      }

      // Use a sub-agent to parse out sub-levels
      const splittedLevels = await this.splitMultiLevelJobDescription(
        multiLevelJD
      );

      // For each sub-level, run the same chain of analysis. Then collect them in memory.
      for (let i = 0; i < splittedLevels.length; i++) {
        const levelJD = splittedLevels[i];
        this.logger.info(
          `Processing sub-level ${i + 1} of ${splittedLevels.length} for ${
            multiLevelJD.titleCode
          }`
        );

        // We'll artificially set .processed = false so the parent's logic can run
        // any sub-agents it needs. Or, you can call `processJobDescription` directly:
        await this.analysisAgent.processJobDescription(
          levelJD,
          i + 1,
          splittedLevels.length
        );

        levelJD.haveProcessedSubLevel = true;
        // Add the newly analyzed sub-level job description to memory
        this.memory.jobDescriptions.push(levelJD);

        await this.saveMemory();
        newSubLevelDescriptions.push(levelJD);

        counter++;
      }
    }

    await this.updateRangedProgress(
      100,
      "Multi-Level Job Description Analysis Completed"
    );

    this.logger.info(
      `Skipped ${skipCounter} multi-level job descriptions because they are in the doNotReprocessTitleCodes list`
    );
    await this.setCompleted("Task Completed");
  }

  private async splitMultiLevelJobDescription(
    multiLevelJD: JobDescription
  ): Promise<JobDescription[]> {
    const splitAgent = new SplitMultiLevelJobDescriptionAgent(
      this.agent,
      this.memory,
      0,
      10
    );
    const splits = await splitAgent.processJobDescription(multiLevelJD);
    return splits.map((split) => ({
      ...multiLevelJD,
      text: split.text,
      name: `${multiLevelJD.name} - Level ${split.level}`,
      titleCode: `${multiLevelJD.titleCode}-level${split.level}`,
      multiLevelJob: false,
      processed: false,
    }));
  }
}
