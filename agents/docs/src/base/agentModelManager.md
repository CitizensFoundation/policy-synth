# PsAiModelManager

The `PsAiModelManager` class is responsible for managing, initializing, and invoking AI chat models (such as OpenAI, Anthropic Claude, Google Gemini, and Azure OpenAI) for PolicySynth agents. It handles model selection, ephemeral overrides, retry logic, token usage tracking, and provides a unified interface for calling different types of AI models.

**File:** `@policysynth/agents/base/agentModelManager.js`

---

## Properties

| Name                | Type                                         | Description                                                                                 |
|---------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| models              | `Map<string, BaseChatModel>`                 | Maps model keys (type_size) to their instantiated chat model objects.                       |
| modelsByType        | `Map<PsAiModelType, BaseChatModel>`          | Maps model types to their default chat model instance.                                      |
| modelIds            | `Map<string, number>`                        | Maps model keys (type_size) to their database IDs.                                          |
| modelIdsByType      | `Map<PsAiModelType, number>`                 | Maps model types to their database IDs.                                                     |
| rateLimits          | `PsModelRateLimitTracking`                   | Tracks rate limits for each model.                                                          |
| userId              | `number`                                     | The user ID associated with this manager.                                                   |
| agentId             | `number`                                     | The agent ID associated with this manager.                                                  |
| maxModelTokensOut   | `number`                                     | Maximum tokens allowed in model output.                                                     |
| modelTemperature    | `number`                                     | Temperature setting for model randomness.                                                   |
| reasoningEffort     | `"low" \| "medium" \| "high"`                | Reasoning effort level for the model.                                                       |
| maxThinkingTokens   | `number`                                     | Maximum tokens for "thinking" (context window).                                             |
| limitedLLMmaxRetryCount | `number`                                 | Max retries for limited LLM calls.                                                          |
| mainLLMmaxRetryCount    | `number`                                 | Max retries for main LLM calls.                                                             |

---

## Methods

| Name                       | Parameters                                                                                                    | Return Type                | Description                                                                                                   |
|----------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                | `aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut?: number, modelTemperature?: number, reasoningEffort?: "low" \| "medium" \| "high", maxThinkingTokens?: number, agentId: number, userId: number` | `PsAiModelManager`         | Initializes the manager with available models and configuration.                                               |
| initializeOneModelFromEnv  | none                                                                                                          | `BaseChatModel \| undefined` | Initializes a single model from environment variables (for ephemeral or fallback use).                        |
| initializeModels           | `aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[]`                   | `void`                     | Initializes all models from the provided configuration and access keys.                                        |
| createEphemeralModel       | `modelType: PsAiModelType, modelSize: PsAiModelSize, options: PsCallModelOptions`                             | `BaseChatModel \| undefined` | Creates a one-off model instance with ephemeral overrides (for fallback or custom calls).                      |
| getApiKeyForProvider       | `provider: string`                                                                                            | `string`                   | Returns the API key for a given provider from environment variables.                                           |
| callModel                  | `modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>`             | Calls the appropriate model type (text, embedding, multimodal, etc.) with the given messages and options.      |
| callTextModel              | `modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>`             | Calls a text-based model, handling ephemeral overrides and fallback logic.                                     |
| runTextModelCall           | `model: BaseChatModel, modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>`             | Executes the actual model call with retry, fallback, and error handling logic.                                 |
| sleepBeforeRetry           | `retryCount: number`                                                                                          | `Promise<void>`            | Sleeps for a calculated time before retrying a failed model call.                                              |
| callEmbeddingModel         | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for embedding model calls (not implemented).                                                       |
| callMultiModalModel        | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for multi-modal model calls (not implemented).                                                     |
| callAudioModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for audio model calls (not implemented).                                                           |
| callVideoModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for video model calls (not implemented).                                                           |
| callImageModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for image model calls (not implemented).                                                           |
| saveTokenUsage             | `prices: PsBaseModelPriceConfiguration, modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, cachedInTokens: number, tokensOut: number` | `Promise<void>`            | Saves or updates token usage statistics in the database.                                                       |
| getTokensFromMessages      | `messages: PsModelMessage[]`                                                                                  | `Promise<number>`          | Calculates the number of tokens used in a set of messages (using Tiktoken).                                   |

### Static Methods

| Name                       | Parameters         | Return Type | Description                                                                                   |
|----------------------------|-------------------|-------------|-----------------------------------------------------------------------------------------------|
| isProhibitedContentError   | `err: any`        | `boolean`   | Checks if an error message is related to prohibited content (for retry/fallback logic).        |

### Static Properties

| Name                       | Type              | Description                                                                                   |
|----------------------------|-------------------|-----------------------------------------------------------------------------------------------|
| prohibitedContentErrors    | `string[]`        | List of error message substrings that indicate prohibited content from the model.              |

---

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';

// Example: Initializing and using the PsAiModelManager

const aiModels = [/* Array of PsAiModelAttributes from your DB or config */];
const accessConfig = [/* Array of YpGroupPrivateAccessConfiguration */];
const agentId = 123;
const userId = 456;

const modelManager = new PsAiModelManager(
  aiModels,
  accessConfig,
  4096,         // maxModelTokensOut
  0.7,          // modelTemperature
  "medium",     // reasoningEffort
  0,            // maxThinkingTokens
  agentId,
  userId
);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What is the capital of France?" }
];

const options = {
  parseJson: false,
  streamingCallbacks: null
};

(async () => {
  const response = await modelManager.callModel(
    "text",      // PsAiModelType.Text
    "medium",    // PsAiModelSize.Medium
    messages,
    options
  );
  console.log("Model response:", response);
})();
```

---

## Notes

- **Model Initialization:** Models are initialized from a combination of database configuration and access keys, with support for ephemeral (one-off) models using environment variables.
- **Ephemeral Overrides:** The manager supports ephemeral overrides for model provider, name, temperature, etc., useful for fallback or custom calls.
- **Retry & Fallback:** Includes robust retry logic, fallback to alternate models/providers, and error handling for rate limits and prohibited content.
- **Token Usage Tracking:** Tracks and persists token usage for billing/monitoring, unless disabled via environment variable.
- **Extensibility:** Placeholders exist for embedding, multimodal, audio, video, and image models, making it easy to extend for new model types.
- **Tiktoken Integration:** Uses Tiktoken to estimate token usage for prompt budgeting.

---

## See Also

- `BaseChatModel`, `ClaudeChat`, `OpenAiChat`, `GoogleGeminiChat`, `AzureOpenAiChat` (AI model implementations)
- `PsAiModelAttributes`, `YpGroupPrivateAccessConfiguration`, `PsCallModelOptions`, `PsModelMessage` (type definitions)
- `PolicySynthAgentBase` (base class for agent managers)
