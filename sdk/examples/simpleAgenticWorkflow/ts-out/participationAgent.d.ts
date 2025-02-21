/**
 * participationAgent.ts
 *
 * Main agent orchestrating the entire flow:
 *  1) Read data from Yrpri connector
 *  2) Analyze each item for theme & sentiment
 *  3) Generate a summary report of all data
 *  4) Export items (with analysis) to Google Sheets
 *  5) Export the summary report to Google Docs
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * The main agent to orchestrate the entire flow.
 */
export declare class ParticipationDataAnalysisAgent extends PolicySynthAgent {
    memory: ParticipationDataAnalysisMemory;
    /**
     * -------------------------------------------------------------------
     *  Static Agent Info & Configuration (UUID, version, user-facing Qs)
     * -------------------------------------------------------------------
     */
    /**
     * A unique ID to identify the base class of this agent.
     * Replace with your own stable UUID so that the system can version-control
     * the agent’s class definition.
     */
    private static readonly PARTICIPATION_DATA_AGENT_CLASS_BASE_ID;
    /**
     * Increment this whenever you introduce a new version of your agent’s logic.
     */
    private static readonly PARTICIPATION_DATA_AGENT_CLASS_VERSION;
    /**
     * Return all metadata needed for the system to register/use this agent class.
     * This follows the same pattern you see in your “DetailedCompetitionAgent” example.
     */
    static getAgentClass(): PsAgentClassCreationAttributes;
    /**
     * If you have additional configuration questions (like “Minimum endorsements”
     * in your competition agent), define them here.
     */
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    /**
     * Default structured question format (mirrors how your example sets it up),
     * so that if your Yrpri connector is using `structuredAnswersJson`,
     * it will know what fields to store/expect.
     */
    static getDefaultStructuredQuestions(): YpStructuredQuestionData[];
    /**
     * -------------------------
     * Constructor & Class Setup
     * -------------------------
     */
    constructor(agent: PsAgent, memory: ParticipationDataAnalysisMemory, startProgress: number, endProgress: number);
    private getAnswerValue;
    translateStructuredAnswersToItem(structuredAnswers: YpStructuredAnswer[], itemName: string): ParticipationData;
    /**
     * -------------------------
     * Main Orchestration Method
     * -------------------------
     *
     *  1) Load data from Yrpri connector
     *  2) Analyze items (sub-agent)
     *  3) Generate summary (sub-agent)
     *  4) Export to Sheets
     *  5) Export to Docs
     */
    process(): Promise<void>;
}
//# sourceMappingURL=participationAgent.d.ts.map