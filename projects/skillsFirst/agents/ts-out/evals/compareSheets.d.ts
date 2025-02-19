import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * The main agent that compares multiple sets of job descriptions
 * imported from all spreadsheet connectors
 * and attempts to mark which connectors are correct on mismatched fields.
 */
export declare class SheetsComparisonAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    private static readonly JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_BASE_ID;
    private static readonly JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_VERSION;
    get reasoningEffort(): "low" | "medium" | "high";
    get maxModelTokensOut(): number;
    /**
     * A structure to track how many times each connector is chosen as correct
     * for each field.
     *
     *  winsCount = {
     *    [connectorName]: { [fieldName]: number }
     *  }
     */
    private winsCount;
    /**
     * A structure to track how many times each connector was evaluated
     * for each field (the denominator when calculating X out of Y correct).
     *
     *  attemptsCount = {
     *    [connectorName]: { [fieldName]: number }
     *  }
     */
    private attemptsCount;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number);
    static getAgentClass(): PsAgentClassCreationAttributes;
    /**
     * Returns a list of questions (configuration fields) for this agent.
     */
    static getConfigurationQuestions(): YpStructuredQuestionData[];
    fieldsToCheck: string[];
    getNestedValue(obj: any, path: string): any;
    /**
     * Main process method:
     *  1) Import job descriptions from *all* spreadsheet connectors
     *  2) Compare relevant fields across connectors
     *  3) For each difference, invoke the LLM to see which connectors are correct
     *  4) Track "wins" for all correct connectors
     */
    process(): Promise<void>;
    /**
     * Increment the counter for a given connector and field (wins).
     */
    private incrementWinCounter;
    /**
     * Increment the 'attempts' counter for a given connector and field (the denominator).
     */
    private incrementAttemptCounter;
    /**
     * Uses the LLM to determine which connectors are correct for the specified difference.
     * Expects JSON in the shape of `ComparisonDifferenceReturn`, e.g.:
     *
     * ```json
     * {
     *   "field": "<field name>",
     *   "correctConnectors": [
     *     { "connectorName": "Connector A", "fieldValue": "yes" },
     *     { "connectorName": "Connector B", "fieldValue": "yes" }
     *   ],
     *   "incorrectConnectors": [
     *     { "connectorName": "Connector C", "fieldValue": "no" }
     *   ],
     *   "explanation": "One short sentence"
     * }
     * ```
     */
    private resolveDifferenceWithLLM;
}
//# sourceMappingURL=compareSheets.d.ts.map