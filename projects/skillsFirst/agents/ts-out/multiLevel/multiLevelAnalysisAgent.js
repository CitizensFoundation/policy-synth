// jobDescriptionMultiLevelAnalysisAgent.ts
import pLimit from "p-limit";
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
    analysisAgent;
    constructor(agent, memory, startProgress, endProgress, analysisAgent) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.analysisAgent = analysisAgent;
    }
    updateMultiLevelJobDataFromJson() {
        try {
            this.logger.info("Updating multi-level job data from JSON file: jobDescriptionsWithNewMultiLevelJob.json");
            const filePath = path.join(__dirname, "data", "jobDescriptionsWithNewMultiLevelJob.json");
            if (!fs.existsSync(filePath)) {
                this.logger.warn("No jobDescriptionsWithNewMultiLevelJob.json file found. Skipping multi-level job updates.");
                return;
            }
            // Parse the file
            const jsonString = fs.readFileSync(filePath, "utf-8");
            const updatedRecords = JSON.parse(jsonString);
            let counter = 0;
            // Loop through each record in the new data
            updatedRecords.forEach((record) => {
                // Find the matching job description in memory
                const existing = this.memory.jobDescriptions.find((jd) => jd.titleCode === record.titleCode && jd.variant === record.variant);
                // If we found a match, update its .multiLevelJob field
                if (existing) {
                    existing.multiLevelJob = record.multiLevelJob;
                    this.logger.info(`Updated multiLevelJob for ${existing.titleCode} (${existing.variant}) to: ${record.multiLevelJob}`);
                    counter++;
                }
                else {
                    // Optional: Log or handle any records not found in memory
                    this.logger.warn(`No matching job description found in memory for titleCode: ${record.titleCode}, variant: ${record.variant}`);
                }
            });
            this.logger.info(`Updated ${counter} multi-level job descriptions`);
        }
        catch (err) {
            this.logger.error("Error updating multi-level job data from JSON file:", err);
        }
    }
    /**
     * Main process method override that first checks for multi-level job descriptions,
     * splits them, runs the analysis for each level, and then exports those newly created
     * sub-level descriptions to Google Sheets.
     */
    async process() {
        await this.updateRangedProgress(0, "Starting Multi-Level Job Description Analysis");
        this.logger.info("Starting Multi-Level Job Description Analysis");
        this.updateMultiLevelJobDataFromJson();
        // Filter out the multi-level job descriptions
        const multiLevelDescriptions = this.memory.jobDescriptions.filter((jd) => jd.multiLevelJob === true);
        // If none are multi-level, we can either do nothing or just run normal parent logic
        if (multiLevelDescriptions.length === 0) {
            this.logger.info("No multi-level job descriptions found. Exiting.");
            await this.updateRangedProgress(100, "No multi-level jobs found. Done.");
            return;
        }
        this.logger.info(`Found ${multiLevelDescriptions.length} multi-level job descriptions`);
        const useMaxCounter = true;
        let counter = 1;
        // For each multi-level job, split it, then process the resulting sub-levels
        const descriptionsToProcess = useMaxCounter
            ? multiLevelDescriptions.slice(0, 300)
            : multiLevelDescriptions;
        // Create a p-limit instance with a concurrency of 10.
        const limit = pLimit(10);
        // Map each job description to a limited asynchronous task.
        const tasks = descriptionsToProcess.map((multiLevelJD, index) => limit(async () => {
            // Logging can help track progress for each task.
            this.logger.info(`Processing job description ${index + 1}`);
            await this.splitMultiLevelJobDescription(multiLevelJD);
            await this.analysisAgent.processJobDescription(multiLevelJD, index + 1, descriptionsToProcess.length);
            multiLevelJD.haveProcessedSubLevel = true;
        }));
        await Promise.all(tasks);
        this.logger.info(`Processed ${tasks.length} multi-level job descriptions`);
        await this.updateRangedProgress(100, "Multi-Level Job Description Analysis Completed");
        this.logger.info(`Processed ${counter} multi-level job descriptions`);
        await this.setCompleted("Task Completed");
    }
    async splitMultiLevelJobDescription(multiLevelJD) {
        const splitAgent = new SplitMultiLevelJobDescriptionAgent(this.agent, this.memory, 0, 10);
        this.logger.info(`Splitting multi-level job description ${multiLevelJD.titleCode} ${multiLevelJD.name}`);
        await splitAgent.processJobDescription(multiLevelJD);
    }
}
//# sourceMappingURL=multiLevelAnalysisAgent.js.map