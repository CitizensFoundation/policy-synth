import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
/**
 * A general purpose deduplication agent that uses fuzzy matching of keys and an LLM to merge duplicates.
 *
 * T: The type of items you want to deduplicate.
 */
export declare class DeduplicationByKeysAgent<T> extends PolicySynthAgent {
    get modelTemperature(): number;
    hasOrganizationName: boolean;
    /**
     * Deduplicates a list of items by merging duplicates that share the same fuzzy key.
     * @param items The list of items to deduplicate.
     * @param keyExtractor A function that given an item returns a string key to group duplicates by.
     * @param systemPrompt A system prompt that explains to the LLM how to merge duplicates.
     * @returns A new array of deduplicated items.
     */
    deduplicateItems(items: T[], keyExtractor: (item: T) => string, systemPrompt?: string | undefined, hasOrganizationName?: boolean): Promise<T[]>;
    /**
     * Normalize a key by:
     * - Lowercasing
     * - Removing common suffixes like inc, corp, corporation, ltd.
     * - Trimming whitespace
     */
    private normalizeKey;
    /**
     * Perform fuzzy grouping of keys so that keys that are similar above a threshold
     * map to the same canonical key.
     */
    private fuzzyGroupKeys;
    get systemPrompt(): string;
    private mergeDuplicatesWithLLM;
}
//# sourceMappingURL=deduplicateByKeys.d.ts.map