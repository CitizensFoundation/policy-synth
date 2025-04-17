import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * A deduplication agent that takes an array of objects and uses the LLM to produce a deduplicated array.
 *
 * This agent does NOT rely on keys or fuzzy matching.
 * It simply sends the entire list of objects to the LLM and requests a deduplicated list back.
 */
export declare class DeduplicationByObjectAgent<T extends object> extends PolicySynthAgent {
    get modelTemperature(): number;
    /**
     * Deduplicates a list of objects by presenting the entire set to the LLM and letting it produce a deduplicated array.
     * @param items The list of objects to deduplicate.
     * @param systemPrompt An optional system prompt that explains how to deduplicate.
     * @returns A new array of deduplicated items.
     */
    deduplicateItems(items: T[], userInstructions: string): Promise<T[]>;
    get systemPrompt(): string;
}
//# sourceMappingURL=deduplicateObjects.d.ts.map