import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
// Make sure you've installed string-similarity: npm install string-similarity
import stringSimilarity from "string-similarity";
/**
 * A general purpose deduplication agent that uses fuzzy matching of keys and an LLM to merge duplicates.
 *
 * T: The type of items you want to deduplicate.
 */
export class DeduplicationByKeysAgent extends PolicySynthAgent {
    get modelTemperature() {
        return 0.0;
    }
    hasOrganizationName = false;
    /**
     * Deduplicates a list of items by merging duplicates that share the same fuzzy key.
     * @param items The list of items to deduplicate.
     * @param keyExtractor A function that given an item returns a string key to group duplicates by.
     * @param systemPrompt A system prompt that explains to the LLM how to merge duplicates.
     * @returns A new array of deduplicated items.
     */
    async deduplicateItems(items, keyExtractor, systemPrompt = undefined, hasOrganizationName = false) {
        this.hasOrganizationName = hasOrganizationName;
        this.logger.debug(`-----------------------------------> Deduplicating items: ${JSON.stringify(items, null, 2)}`);
        if (items.length < 2) {
            this.logger.debug(`-----------------------------------> No duplicates found, returning items as is`);
            return items;
        }
        // Normalize and fuzzy-match keys first
        const fuzzyKeyMap = this.fuzzyGroupKeys(items, keyExtractor);
        // Create new array of items with their fuzzy-normalized keys attached
        const normalizedItems = items.map((item) => {
            const originalKey = keyExtractor(item);
            const normalizedKey = fuzzyKeyMap.get(this.normalizeKey(originalKey));
            return { item, normalizedKey };
        });
        // Now group by normalized keys
        const grouped = normalizedItems.reduce((acc, { item, normalizedKey }) => {
            if (!acc[normalizedKey]) {
                acc[normalizedKey] = [];
            }
            acc[normalizedKey].push(item);
            return acc;
        }, {});
        const deduplicated = [];
        this.logger.debug(`-----------------------------------> Grouped items: ${JSON.stringify(grouped, null, 2)}`);
        for (const group of Object.values(grouped)) {
            if (group.length === 1) {
                deduplicated.push(group[0]);
            }
            else if (group[0]) {
                let organizationName = null;
                if (this.hasOrganizationName) {
                    organizationName = group[0].organizationName;
                }
                await this.updateRangedProgress(undefined, `Deduplicating Web Content ${organizationName ? `- ${organizationName} -` : ""} (${deduplicated.length}/${items.length})`);
                const merged = await this.mergeDuplicatesWithLLM(group, systemPrompt);
                if (merged) {
                    deduplicated.push(merged);
                }
                else {
                    // If merging fails for some reason, fallback to the first item
                    deduplicated.push(group[0]);
                }
            }
            else {
                this.logger.error(`Can't find group.`);
            }
        }
        this.logger.debug(`-----------------------------------> Deduplicated items: ${JSON.stringify(deduplicated, null, 2)}`);
        return deduplicated;
    }
    /**
     * Normalize a key by:
     * - Lowercasing
     * - Removing common suffixes like inc, corp, corporation, ltd.
     * - Trimming whitespace
     */
    normalizeKey(key) {
        let normalized = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        normalized = normalized.toLowerCase().trim();
        // Remove common corporate suffixes
        const removeWords = [
            "inc",
            "corp",
            "corporation",
            "ltd",
            "organization",
            "ehf.",
            "ehf",
            "hf.",
            "hf",
            "llc",
            "limited",
        ];
        for (const w of removeWords) {
            const regex = new RegExp(`\\b${w}\\b`, "gi");
            normalized = normalized.replace(regex, "");
        }
        // Collapse multiple spaces
        normalized = normalized.replace(/\s+/g, " ").trim();
        return normalized;
    }
    /**
     * Perform fuzzy grouping of keys so that keys that are similar above a threshold
     * map to the same canonical key.
     */
    fuzzyGroupKeys(items, keyExtractor) {
        const threshold = 0.8;
        const canonicalKeys = [];
        const keyMap = new Map();
        for (const item of items) {
            const origKey = keyExtractor(item);
            const normKey = this.normalizeKey(origKey);
            if (canonicalKeys.length === 0) {
                // First key is always canonical
                canonicalKeys.push(normKey);
                keyMap.set(normKey, normKey);
            }
            else {
                const { bestMatch } = stringSimilarity.findBestMatch(normKey, canonicalKeys);
                if (bestMatch.rating >= threshold) {
                    // Use the matched canonical key
                    keyMap.set(normKey, bestMatch.target);
                }
                else {
                    // Add a new canonical key
                    canonicalKeys.push(normKey);
                    keyMap.set(normKey, normKey);
                }
            }
        }
        return keyMap;
    }
    get systemPrompt() {
        return `You are a helpful assistant that merges duplicate entries of arbitrary JSON objects into a single, consolidated JSON object.

Instructions:
- You are given multiple JSON objects representing the same entity.
- Merge their fields intelligently and remove duplicates and near duplicates.
- If a text field differs between objects, pick the most consistent or best-value field.
- Combine textual fields by merging or summarizing them.
${this.hasOrganizationName
            ? "- You must preserve any organizationName. If multiple duplicates have different organization names, choose the best or combine them. Never drop this field or set it to an empty string."
            : ""}
- For arrays, merge them but only really unique items never include duplicates or near duplicates.
- Always return strict JSON, no extra text.`;
    }
    async mergeDuplicatesWithLLM(duplicates, systemPrompt = undefined) {
        const userPrompt = `Here are multiple JSON objects representing duplicates of the same entity:
${JSON.stringify(duplicates, null, 2)}

Now produce a single merged JSON object that consolidates all the data from above.
Return a JSON object with fields only, with no additional text.

Your JSON Output:`;
        const messages = [
            { role: "system", message: systemPrompt || this.systemPrompt },
            { role: "user", message: userPrompt },
        ];
        console.log(`DeduplicationAgent: Calling LLM with prompt: ${JSON.stringify(messages, null, 2)}`);
        const response = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages));
        if (!response.organizationName || response.organizationName.trim() === "") {
            // Attempt to find a real organizationName from one of the duplicates
            const fallback = duplicates.find((d) => d.organizationName && d.organizationName.trim());
            if (fallback)
                response.organizationName = fallback.organizationName;
        }
        console.log(`DeduplicationAgent: LLM response: ${JSON.stringify(response, null, 2)}`);
        return response;
    }
}
//# sourceMappingURL=deduplicateByKeys.js.map