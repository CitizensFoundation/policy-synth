import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";

// ------------------
// Child Agents
// ------------------
import { DetermineCollegeDegreeStatusAgent } from "./reviewAgents/determineStatus.js";
import { ReviewEvidenceQuoteAgent } from "./reviewAgents/reviewEvidenceAgent.js";
import { DetermineMandatoryStatusAgent } from "./reviewAgents/mantatoryStatus.js";
import { DetermineProfessionalLicenseRequirementAgent } from "./reviewAgents/additionalRequirements.js";
import { IdentifyBarriersAgent } from "./reviewAgents/identifyBarriers.js";
import { ValidateJobDescriptionAgent } from "./reviewAgents/dataConsistency.js";
import { ReadabilityFleshKncaidJobDescriptionAgent } from "./reviewAgents/readabilityAnalysisFleshKncaid.js";
import { ReadingLevelAnalysisAgent } from "./reviewAgents/readingLevelAnalysis.js";
import { SheetsJobDescriptionExportAgent } from "./exports/sheetsExport.js";

// ------------------
// Type Definitions
// ------------------
/**
 * The main agent class for analyzing job descriptions.
 * Reads configuration using `this.getConfig(...)` for toggles and numeric settings.
 */
export class JobDescriptionAnalysisAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  override get modelTemperature(): number {
    return 0.0; // Hard-coded example
  }

  private static readonly JOB_DESCRIPTION_AGENT_CLASS_BASE_ID =
    "efe71e49-50e5-4636-b3bd-f4adc97bbad4";
  private static readonly JOB_DESCRIPTION_AGENT_CLASS_VERSION = 3;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  /**
   * Main process method that orchestrates the entire job description analysis.
   */
  async process() {
    await this.updateRangedProgress(0, "Starting Job Description Analysis");

    let allJobDescriptions;
    const rerunExistingInMemory = this.getConfig<boolean>(
      "rerunExistingInMemory",
      true
    );

    if (false && !rerunExistingInMemory) {
      // Load jobDescriptions.json (adjust path for your environment)
      const jobDescriptionsData = fs.readFileSync(
        path.join(__dirname, "data", "jobDescriptions.json"),
        "utf-8"
      );

      allJobDescriptions = JSON.parse(jobDescriptionsData) as JobDescription[];
    } else {
      allJobDescriptions = this.memory.jobDescriptions;
    }
    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 1) Retrieve config values via this.getConfig(...)
    const numJobDescriptions = this.getConfig<number>("numJobDescriptions", 10);

    const useRandomJobDescriptions = this.getConfig<boolean>(
      "useRandomJobDescriptions",
      false
    );

    let selectedJobDescriptions;

    if (false && useRandomJobDescriptions) {
      selectedJobDescriptions = this.selectRandomJobDescriptions(
        allJobDescriptions,
        numJobDescriptions
      );
    } else {
      selectedJobDescriptions = allJobDescriptions.slice(0, numJobDescriptions);
    }

    this.memory.jobDescriptions = selectedJobDescriptions;

    // 3) Process each job description
    for (let i = 0; i < selectedJobDescriptions.length; i++) {
      const jobDescription = selectedJobDescriptions[i];

      // If there's an existing error, skip it
      if (jobDescription.error && jobDescription.error.trim() !== "") {
        this.logger.warn(
          `Skipping '${jobDescription.titleCode}' due to existing error: ${jobDescription.error}`
        );
        continue;
      }

      const progress = (i / selectedJobDescriptions.length) * 100;
      await this.updateRangedProgress(
        progress,
        `Processing job description ${i + 1} of ${
          selectedJobDescriptions.length
        }`
      );

      // Check if we have a matching HTML file
      const htmlFilePath = path.join(
        __dirname,
        "data",
        "descriptions",
        `${jobDescription.titleCode}.html`
      );
      if (!fs.existsSync(htmlFilePath)) {
        this.logger.error(
          `HTML file not found for ${jobDescription.titleCode}`
        );
        jobDescription.error = `HTML file not found for ${jobDescription.titleCode}`;
        continue;
      }

      // Read HTML content
      const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
      jobDescription.text = this.extractTextFromHtml(htmlContent);

      // Process the job description
      await this.processJobDescription(jobDescription);

      // Mark as processed
      jobDescription.processed = true;
      await this.saveMemory();
    }

    const googleSheetsReportAgent = new SheetsJobDescriptionExportAgent(
      this.agent,
      this.memory,
      95,
      100,
      "Sheet1"
    );

    await googleSheetsReportAgent.processJsonData({
      agentId: this.agent.id,
      jobDescriptions: this.memory.jobDescriptions,
    });

    // Finalize and mark agent as completed
    await this.saveMemory();
    await this.updateRangedProgress(100, "Job Description Analysis Completed");
    await this.setCompleted("Task Completed");
  }

  /**
   * Processes a single job description, using config toggles for each step.
   */
  private async processJobDescription(jobDescription: JobDescription) {
    // Read toggles from config using getConfig
    const enableDetermineCollegeDegreeStatus = this.getConfig<boolean>(
      "enableDetermineCollegeDegreeStatus",
      true
    );
    const enableReviewEvidenceQuote = this.getConfig<boolean>(
      "enableReviewEvidenceQuote",
      true
    );
    const enableDetermineMandatoryStatus = this.getConfig<boolean>(
      "enableDetermineMandatoryStatus",
      true
    );
    const enableDetermineProfessionalLicense = this.getConfig<boolean>(
      "enableDetermineProfessionalLicense",
      true
    );
    const enableIdentifyBarriers = this.getConfig<boolean>(
      "enableIdentifyBarriers",
      true
    );
    const enableValidateJobDescription = this.getConfig<boolean>(
      "enableValidateJobDescription",
      true
    );
    const enableReadabilityScore = this.getConfig<boolean>(
      "enableReadabilityScore",
      true
    );
    const enableReadingLevelAnalysis = this.getConfig<boolean>(
      "enableReadingLevelAnalysis",
      true
    );

    // STEP 1: Determine if the JobDescription includes college/higher ed requirement
    if (enableDetermineCollegeDegreeStatus) {
      const determineDegreeStatusAgent = new DetermineCollegeDegreeStatusAgent(
        this.agent,
        this.memory,
        0,
        14
      );
      await determineDegreeStatusAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    if (jobDescription.degreeAnalysis.includesMultipleJobLevelsWithDifferentEducationalRequirements) {
      this.logger.warn(`Job description ${jobDescription.titleCode} has multiple job levels with different educational requirements`);
    }

    // STEP 2: Review evidence quote for higher education
    if (enableReviewEvidenceQuote) {
      const reviewEvidenceQuoteAgent = new ReviewEvidenceQuoteAgent(
        this.agent,
        this.memory,
        14,
        28
      );
      await reviewEvidenceQuoteAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    // STEP 3: Determine if degree requirement is mandatory or permissive
    if (enableDetermineMandatoryStatus) {
      const determineMandatoryStatusAgent = new DetermineMandatoryStatusAgent(
        this.agent,
        this.memory,
        28,
        42
      );
      await determineMandatoryStatusAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    // STEP 4: Determine if a professional license is required
    if (enableDetermineProfessionalLicense) {
      const determineProfessionalLicenseAgent =
        new DetermineProfessionalLicenseRequirementAgent(
          this.agent,
          this.memory,
          42,
          56
        );
      await determineProfessionalLicenseAgent.processJobDescription(
        jobDescription
      );
      await this.saveMemory();
    }

    // STEP 5: Identify barriers for non-degree applicants
    if (enableIdentifyBarriers) {
      const identifyBarriersAgent = new IdentifyBarriersAgent(
        this.agent,
        this.memory,
        56,
        70
      );
      await identifyBarriersAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    // STEP 6: Validate data consistency
    if (enableValidateJobDescription) {
      const validateJobDescriptionAgent = new ValidateJobDescriptionAgent(
        this.agent,
        this.memory,
        70,
        84
      );
      await validateJobDescriptionAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    // STEP 7: Analyze readability via Flesch-Kincaid
    if (enableReadabilityScore) {
      const readabilityAgent = new ReadabilityFleshKncaidJobDescriptionAgent(
        this.agent,
        this.memory,
        84,
        100
      );
      await readabilityAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    // STEP 8: Analyze reading level & extract difficult passages
    if (enableReadingLevelAnalysis) {
      const readingLevelAgent = new ReadingLevelAnalysisAgent(
        this.agent,
        this.memory,
        90,
        95
      );
      await readingLevelAgent.processJobDescription(jobDescription);
      await this.saveMemory();
    }

    await this.saveMemory();
  }

  /**
   * Selects a subset of job descriptions at random.
   */
  private selectRandomJobDescriptions(
    allJobDescriptions: JobDescription[],
    numToSelect: number
  ): JobDescription[] {
    const shuffled = allJobDescriptions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numToSelect);
  }

  /**
   * Extracts text from basic HTML by removing tags.
   */
  private extractTextFromHtml(htmlContent: string): string {
    return htmlContent.replace(/<[^>]*>?/gm, "");
  }

  /**
   * Returns the metadata used to register this agent class in your system.
   */
  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.JOB_DESCRIPTION_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Job Description Analysis Agent",
      version: this.JOB_DESCRIPTION_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        category: PsAgentClassCategories.HRManagement,
        subCategory: "jobDescriptionAnalysis",
        hasPublicAccess: false,
        description:
          "An agent for analyzing job descriptions for education requirements",
        queueName: "JOB_DESCRIPTION_ANALYSIS",
        imageUrl:
          "https://aoi-storage-production.citizens.is/ypGenAi/community/1/d243273c-f11e-4055-9a78-eaa1fa4baa28.png",
        iconName: "job_description_analysis",
        capabilities: ["analysis", "text processing"],
        requestedAiModelSizes: [
          PsAiModelSize.Small,
          PsAiModelSize.Medium,
          PsAiModelSize.Large,
        ],
        defaultStructuredQuestions: [
          {
            uniqueId: "numJobDescriptions",
            type: "textField",
            subType: "number",
            value: 10,
            maxLength: 4,
            required: true,
            text: "Number of job descriptions to analyze",
          },
        ],
        supportedConnectors: [] as PsConnectorClassTypes[],
        questions: this.getConfigurationQuestions(),
      },
    };
  }

  /**
   * Returns a list of questions (configuration fields) for this agent.
   */
  static getConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      // How many job descriptions to process
      {
        uniqueId: "numJobDescriptions",
        type: "textField",
        subType: "number",
        value: 10,
        maxLength: 4,
        required: true,
        text: "Number of job descriptions to analyze",
      },
      // Whether or not to rerun analysis on items that are already in memory
      {
        uniqueId: "rerunExistingInMemory",
        type: "checkbox",
        text: "Rerun analysis on job descriptions already in memory",
        value: false, // default is off
      },
      // Whether or not to use random job descriptions
      {
        uniqueId: "useRandomJobDescriptions",
        type: "checkbox",
        text: "Use random job descriptions",
        value: true, // default is on
      },
      // Checkboxes to enable/disable each step in the workflow
      {
        uniqueId: "enableDetermineCollegeDegreeStatus",
        type: "checkbox",
        text: "Step 1: Determine College Degree/Higher Education Requirement",
        value: true, // default enabled
      },
      {
        uniqueId: "enableReviewEvidenceQuote",
        type: "checkbox",
        text: "Step 2: Review Evidence Quote for Higher Education",
        value: true, // default enabled
      },
      {
        uniqueId: "enableDetermineMandatoryStatus",
        type: "checkbox",
        text: "Step 3: Determine Mandatory vs. Permissive Requirements",
        value: true, // default enabled
      },
      {
        uniqueId: "enableDetermineProfessionalLicense",
        type: "checkbox",
        text: "Step 4: Check Professional License Requirements",
        value: true, // default enabled
      },
      {
        uniqueId: "enableIdentifyBarriers",
        type: "checkbox",
        text: "Step 5: Identify Potential Barriers for Non-Degree Applicants",
        value: true, // default enabled
      },
      {
        uniqueId: "enableValidateJobDescription",
        type: "checkbox",
        text: "Step 6: Validate Data Consistency",
        value: true, // default enabled
      },
      {
        uniqueId: "enableReadabilityScore",
        type: "checkbox",
        text: "Step 7: Readability Analysis via Flesch-Kincaid",
        value: true, // default enabled
      },
      {
        uniqueId: "enableReadingLevelAnalysis",
        type: "checkbox",
        text: "Step 8: Reading Level / US Grade Analysis",
        value: true, // default enabled
      },
    ];
  }
}
