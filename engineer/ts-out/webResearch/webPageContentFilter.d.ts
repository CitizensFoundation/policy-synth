import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * Upgraded PsEngineerWebContentFilter class to use:
 * - `createSystemMessage` & `createHumanMessage` from your base agent
 * - `callModel` in place of direct ChatOpenAI usage
 * - optional concurrency using `p-limit` for filtering large arrays
 */
export declare class PsEngineerWebContentFilter extends PolicySynthAgent {
    memory: PsEngineerMemoryData;
    get modelTemperature(): number;
    get maxModelTokensOut(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number);
    /**
     * A short system prompt describing how the model should respond with “Yes” or “No”.
     */
    get filterSystemPrompt(): string;
    /**
     * A user prompt that includes the user's dev task context plus the snippet to evaluate.
     */
    filterUserPrompt(contentToEvaluate: string): string;
    /**
     * Filter incoming content: returns only items that the model deems “Yes”.
     * Optionally parallelize with p-limit if you have a large set of content.
     */
    filterContent(webContentToFilter: string[]): Promise<string[]>;
}
//# sourceMappingURL=webPageContentFilter.d.ts.map