import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";

export class DeduplicationManyToOneAgent<T extends object> extends PolicySynthAgent {
  override get modelTemperature(): number { return 0.0; }

  /**
   * Takes an array of objects and returns a single merged object that combines all the data.
   * @param items The array of objects to merge into one.
   * @param systemPrompt Optional system prompt for the LLM.
   * @returns A single merged object.
   */
  async deduplicateItems(
    items: T[],
    systemPrompt: string | undefined = undefined
  ): Promise<T> {
    if (items.length === 0) {
      // If no items, return an empty object
      return {} as T;
    }

    if (items.length === 1) {
      // If only one item, just return it
      return items[0];
    }

    const userPrompt = `Here are the objects:
${JSON.stringify(items, null, 2)}

Return a single JSON object (strict JSON only, with no additional commentary).

Your single JSON object with fields:`;

    const messages = [
      { role: "system", message: systemPrompt || this.systemPrompt },
      { role: "user", message: userPrompt },
    ];

    console.log(
      `DeduplicationManyToOneAgent: Calling LLM with prompt: ${JSON.stringify(
        messages,
        null,
        2
      )}`
    );

    const response = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      messages
    );

    console.log(
      `DeduplicationManyToOneAgent: LLM response: ${JSON.stringify(response, null, 2)}`
    );

    return response;
  }

  get systemPrompt(): string {
    return `You are a helpful assistant that merges multiple JSON objects in an array into a single consolidated JSON object.

Instructions:
- You will be given multiple JSON objects that may represent the same or related entities.
- Your job is to produce a single JSON object that represents all of them combined.
- Merge differing fields intelligently. If there's conflicting text, pick the best or most comprehensive version.
- For arrays, merge them and keep unique items.
- Remove duplicates and near duplicates.
- Always return one JSON object with fields, with no additional commentary.`;
  }
}
