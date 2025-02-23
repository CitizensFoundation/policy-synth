import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * The main agent class for analyzing job descriptions.
 * Reads configuration using `this.getConfig(...)` for toggles and numeric settings.
 */
export declare class JobDescriptionAnalysisAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    get modelTemperature(): number;
    private static readonly JOB_DESCRIPTION_AGENT_CLASS_BASE_ID;
    private static readonly JOB_DESCRIPTION_AGENT_CLASS_VERSION;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    /**
     * Main process method that orchestrates the entire job description analysis.
     */
    process(): Promise<void>;
    /**
     * Processes a single job description, using config toggles for each step.
     */
    processJobDescription(jobDescription: JobDescription, processCounter: number, totalProcesses: number): Promise<void>;
    /**
     * Selects a subset of job descriptions at random.
     */
    private selectRandomJobDescriptions;
    /**
     * Extracts text from basic HTML by removing tags.
     */
    private extractTextFromHtml;
    /**
     * Returns the metadata used to register this agent class in your system.
     */
    static getAgentClass(): PsAgentClassCreationAttributes;
    /**
     * Returns a list of questions (configuration fields) for this agent.
     */
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=analysisAgent.d.ts.map