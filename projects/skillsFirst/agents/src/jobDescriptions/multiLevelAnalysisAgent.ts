// jobDescriptionMultiLevelAnalysisAgent.ts

import { JobDescriptionAnalysisAgent } from "./analysisAgent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { SheetsJobDescriptionExportAgent } from "./exports/sheetsExport.js";
import { SplitMultiLevelJobDescriptionAgent } from "./multiLevel/splitMultiLevelAgent.js";
import fs from "fs";
import path from "path";

/**
 * A specialized subclass that handles multi-level job descriptions.
 * If a JobDescription has .multiLevelJob = true, then we:
 *  1) Use a new sub-agent to split that JobDescription into multiple sub-levels,
 *     returning an array of new JobDescription objects (one per level).
 *  2) For each sub-level, we run the same chain of analysis sub-agents as in the parent class.
 *  3) We add those new sub-level JobDescriptions to memory.
 *  4) We export only those sub-level JobDescriptions to Google Sheets.
 */
export class JobDescriptionMultiLevelAnalysisAgent extends JobDescriptionAnalysisAgent {
  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  private updateMultiLevelJobDataFromJson(): void {
    try {
      const filePath = path.join(__dirname, "data", "jobDescriptionsWithNewMultiLevelJob.json");

      if (!fs.existsSync(filePath)) {
        this.logger.warn("No jobDescriptionsWithNewMultiLevelJob.json file found. Skipping multi-level job updates.");
        return;
      }

      // Parse the file
      const jsonString = fs.readFileSync(filePath, "utf-8");
      const updatedRecords: JobDescription[] = JSON.parse(jsonString);

      // Loop through each record in the new data
      updatedRecords.forEach((record) => {
        // Find the matching job description in memory
        const existing = this.memory.jobDescriptions.find(
          (jd) => jd.titleCode === record.titleCode && jd.variant === record.variant
        );

        // If we found a match, update its .multiLevelJob field
        if (existing) {
          existing.multiLevelJob = record.multiLevelJob;
          this.logger.info(
            `Updated multiLevelJob for ${existing.titleCode} (${existing.variant}) to: ${record.multiLevelJob}`
          );
        } else {
          // Optional: Log or handle any records not found in memory
          this.logger.warn(
            `No matching job description found in memory for titleCode: ${record.titleCode}, variant: ${record.variant}`
          );
        }
      });
    } catch (err) {
      this.logger.error("Error updating multi-level job data from JSON file:", err);
    }
  }

  /**
   * Main process method override that first checks for multi-level job descriptions,
   * splits them, runs the analysis for each level, and then exports those newly created
   * sub-level descriptions to Google Sheets.
   */
  override async process() {
    await this.updateRangedProgress(0, "Starting Multi-Level Job Description Analysis");

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

    const newSubLevelDescriptions: JobDescription[] = [];

    // For each multi-level job, split it, then process the resulting sub-levels
    for (const multiLevelJD of multiLevelDescriptions) {
      // Use a sub-agent to parse out sub-levels
      const splittedLevels = await this.splitMultiLevelJobDescription(multiLevelJD);

      // For each sub-level, run the same chain of analysis. Then collect them in memory.
      for (let i = 0; i < splittedLevels.length; i++) {
        const levelJD = splittedLevels[i];

        // We'll artificially set .processed = false so the parent's logic can run
        // any sub-agents it needs. Or, you can call `processJobDescription` directly:
        await this.processJobDescription(levelJD, i + 1, splittedLevels.length);

        // Add the newly analyzed sub-level job description to memory
        this.memory.jobDescriptions.push(levelJD);
        newSubLevelDescriptions.push(levelJD);
      }
    }

    // Finally, export only the new sub-level job descriptions to Google Sheets
    const googleSheetsReportAgent = new SheetsJobDescriptionExportAgent(
      this.agent,
      this.memory,
      95,
      100,
      "MultiLevelSheet"
    );

    const combinedAllJobDescriptions = [...this.memory.jobDescriptions, ...newSubLevelDescriptions];

    // We'll just pass the new sub-levels, not the entire memory array
    await googleSheetsReportAgent.processJsonData({
      agentId: this.agent.id,
      jobDescriptions: combinedAllJobDescriptions,
    });

    await this.updateRangedProgress(100, "Multi-Level Job Description Analysis Completed");
    await this.setCompleted("Task Completed");
  }

  private async splitMultiLevelJobDescription(multiLevelJD: JobDescription): Promise<JobDescription[]> {
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
