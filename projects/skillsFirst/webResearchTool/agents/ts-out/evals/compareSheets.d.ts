import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * The main agent that compares multiple sheets of job descriptions
 * and attempts to resolve conflicts using an LLM.
 */
export declare class SheetsComparisonAgent extends PolicySynthAgent {
    private sheetNames;
    memory: JobDescriptionMemoryData;
    private static readonly JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_BASE_ID;
    private static readonly JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_VERSION;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number);
    static getAgentClass(): PsAgentClassCreationAttributes;
    /**
     * Returns a list of questions (configuration fields) for this agent.
     */
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    /**
     * Main process method:
     *   1) read from each sheet
     *   2) compare relevant fields
     *   3) for each difference, invoke the LLM to pick the correct value
     *   4) produce a final "resolved" set of differences
     */
    process(): Promise<void>;
    /**
     * Uses the LLM to determine the best/correct value for the specified difference.
     * We supply it with:
     *   1) The original job description text
     *   2) The field in question
     *   3) The different candidate values from each sheet
     * We'll ask the LLM to either pick the best single value or say "Cannot determine".
     */
    private resolveDifferenceWithLLM;
}
//# sourceMappingURL=compareSheets.d.ts.map