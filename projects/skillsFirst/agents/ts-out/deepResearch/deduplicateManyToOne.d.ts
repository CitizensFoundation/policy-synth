import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export declare class DeduplicationManyToOneAgent<T extends object> extends PolicySynthAgent {
    get modelTemperature(): number;
    /**
     * Takes an array of objects and returns a single merged object that combines all the data.
     * @param items The array of objects to merge into one.
     * @param systemPrompt Optional system prompt for the LLM.
     * @returns A single merged object.
     */
    deduplicateItems(items: T[], systemPrompt?: string | undefined): Promise<T>;
    get systemPrompt(): string;
}
//# sourceMappingURL=deduplicateManyToOne.d.ts.map