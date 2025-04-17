import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
/**
 * A deduplication agent that takes an array of objects and uses the LLM to produce a deduplicated array.
 *
 * This agent does NOT rely on keys or fuzzy matching.
 * It simply sends the entire list of objects to the LLM and requests a deduplicated list back.
 */
export class DeduplicationByObjectAgent extends PolicySynthAgent {
    get modelTemperature() { return 0.0; }
    /**
     * Deduplicates a list of objects by presenting the entire set to the LLM and letting it produce a deduplicated array.
     * @param items The list of objects to deduplicate.
     * @param systemPrompt An optional system prompt that explains how to deduplicate.
     * @returns A new array of deduplicated items.
     */
    async deduplicateItems(items, userInstructions) {
        if (items.length < 2) {
            return items;
        }
        const userPrompt = `Below is a list of JSON objects that may contain duplicates and possibly not relevant items to the user instructions.
Your task is to return a new JSON array of objects that have been deduplicated and merged where needed.
We want each object to be unique and not contain any duplicate information.
You can merge together one or more objects into single objects.

If the objects represent entities that may have multiple similar fields, handle differences intelligently. If you have to combine fields, do so.
If items are clearly duplicates (the same entity with slight differences), merge them into a single representative object. If objects are distinct, keep them as separate items.

Remove duplicates and near duplicates.

Always return strict JSON only, with no additional commentary.

${userInstructions}

Here are the objects to deduplicate:
${JSON.stringify(items, null, 2)}

Return the deduplicated array as a JSON array:`;
        const messages = [
            { role: "system", message: this.systemPrompt },
            { role: "user", message: userPrompt },
        ];
        console.log(`DeduplicationByObjectAgent: Calling LLM with prompt: ${JSON.stringify(messages, null, 2)}`);
        const response = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, true, false);
        console.log(`DeduplicationByObjectAgent: LLM response: ${JSON.stringify(response, null, 2)}`);
        return response;
    }
    get systemPrompt() {
        return `You are a helpful assistant that deduplicates a list of arbitrary JSON objects into a single, consolidated JSON array.

Instructions:
- You are given multiple JSON objects that may represent duplicates of the same entities.
- Merge duplicates intelligently into a single representative object.
- If a text field differs between duplicates, pick the best or most representative value.
- Combine textual fields by merging or summarizing them if necessary.
- For arrays or lists in the objects, merge them by including unique items from each duplicate.
- Remove duplicates and near duplicates.
- Always return a strict JSON array with objects and fields, with no additional commentary.`;
    }
}
//# sourceMappingURL=deduplicateObjects.js.map