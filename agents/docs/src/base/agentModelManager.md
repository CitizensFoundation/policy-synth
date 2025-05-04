# PsAiModelManager

The `PsAiModelManager` class is responsible for managing, initializing, and invoking AI chat models (such as OpenAI, Anthropic Claude, Google Gemini, and Azure OpenAI) for PolicySynth agents. It handles model selection, ephemeral overrides, retry/fallback logic, token usage tracking, and provides a unified interface for calling different types of AI models.

**File:** `@policysynth/agents/base/agentModelManager.js`

---

## Properties

| Name                | Type                                         | Description                                                                                 |
|---------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| models              | `Map<string, BaseChatModel>`                 | Maps model keys (type_size) to their instantiated chat model objects.                       |
| modelsByType        | `Map<PsAiModelType, BaseChatModel>`          | Maps model types to their default chat model instance.                                      |
| modelIds            | `Map<string, number>`                        | Maps model keys (type_size) to their database IDs.                                          |
| modelIdsByType      | `Map<PsAiModelType, number>`                 | Maps model types to their database IDs.                                                     |
| rateLimits          | `PsModelRateLimitTracking`                   | Tracks rate limits and usage for each model.                                                |
| userId              | `number`                                     | The user ID associated with this manager.                                                   |
| agentId             | `number`                                     | The agent ID associated with this manager.                                                  |
| maxModelTokensOut   | `number`                                     | Maximum tokens allowed in model output.                                                     |
| modelTemperature    | `number`                                     | Temperature setting for model sampling.                                                     |
| reasoningEffort     | `"low" \| "medium" \| "high"`                | Reasoning effort level for the model.                                                       |
| maxThinkingTokens   | `number`                                     | Maximum tokens for model "thinking" (context window).                                       |
| limitedLLMmaxRetryCount | `number`                                 | Max retries for limited LLM calls (default: 3).                                             |
| mainLLMmaxRetryCount    | `number`                                 | Max retries for main LLM calls (default: 75).                                               |

---

## Static Properties

| Name                        | Type         | Description                                                                                 |
|-----------------------------|--------------|---------------------------------------------------------------------------------------------|
| prohibitedContentErrors     | `string[]`   | List of error message substrings indicating prohibited content from model responses.         |
| isProhibitedContentError    | `(err: any) => boolean` | Checks if an error message matches a prohibited content error.                      |

---

## Methods

| Name                       | Parameters                                                                                                    | Return Type                | Description                                                                                                   |
|----------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                | `aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut?: number, modelTemperature?: number, reasoningEffort?: "low" \| "medium" \| "high", maxThinkingTokens?: number, agentId: number, userId: number` | `PsAiModelManager`         | Initializes the manager with models, access config, and settings.                                             |
| initializeOneModelFromEnv  | none                                                                                                          | `BaseChatModel \| undefined` | Initializes a model from environment variables (for ephemeral or fallback use).                               |
| initializeModels           | `aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[]`                   | `void`                     | Initializes all models from provided configs and access keys.                                                  |
| createEphemeralModel       | `modelType: PsAiModelType, modelSize: PsAiModelSize, options: PsCallModelOptions`                             | `BaseChatModel \| undefined` | Creates a one-off model instance with ephemeral overrides (for fallback or custom calls).                     |
| getApiKeyForProvider       | `provider: string`                                                                                            | `string`                   | Returns the API key for a given provider from environment variables.                                           |
| callModel                  | `modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>`             | Calls the appropriate model type (text, embedding, multimodal, etc.) with fallback and retry logic.           |
| callTextModel              | `modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>`             | Calls a text model, handling ephemeral overrides, fallback, and retry logic.                                  |
| runTextModelCall           | `model: BaseChatModel, modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions` | `Promise<any>` | Actually performs the model call, with retry/fallback, JSON parsing, and usage tracking.                      |
| sleepBeforeRetry           | `retryCount: number`                                                                                          | `Promise<void>`            | Sleeps for a calculated time before retrying a failed model call.                                             |
| callEmbeddingModel         | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for embedding model calls (not implemented).                                                      |
| callMultiModalModel        | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for multimodal model calls (not implemented).                                                     |
| callAudioModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for audio model calls (not implemented).                                                          |
| callVideoModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for video model calls (not implemented).                                                          |
| callImageModel             | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`             | Placeholder for image model calls (not implemented).                                                          |
| saveTokenUsage             | `modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number`                     | `Promise<void>`            | Saves or updates token usage statistics in the database (unless disabled).                                    |
| getTokensFromMessages      | `messages: PsModelMessage[]`                                                                                  | `Promise<number>`          | Estimates the number of tokens in a set of messages using Tiktoken.                                           |

---

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';

// Example: Initializing and using PsAiModelManager

const aiModels = [/* Array of PsAiModelAttributes from your DB or config */];
const accessConfig = [/* Array of YpGroupPrivateAccessConfiguration */];

const manager = new PsAiModelManager(
  aiModels,
  accessConfig,
  4096,      // maxModelTokensOut
  0.7,       // modelTemperature
  "medium",  // reasoningEffort
  0,         // maxThinkingTokens
  123,       // agentId
  456        // userId
);

const messages = [
  { role: "user", message: "What is the capital of France?" }
];

const options = {
  parseJson: false,
  streamingCallbacks: null
};

(async () => {
  const response = await manager.callModel(
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

- **Model Initialization:** Models can be initialized from explicit configuration or from environment variables (for ephemeral/fallback use).
- **Ephemeral Models:** The manager supports one-off model overrides for provider, name, temperature, etc., useful for fallback or custom calls.
- **Retry & Fallback:** Includes robust retry logic, fallback to alternate models/providers, and detection of prohibited content errors.
- **Token Usage Tracking:** Optionally tracks and persists token usage to the database, unless disabled via environment variable.
- **Extensibility:** Placeholders exist for embedding, multimodal, audio, video, and image models.
- **Error Handling:** Handles 5xx, 429, and prohibited content errors with retries and fallback logic.

---

## See Also

- `BaseChatModel`, `ClaudeChat`, `OpenAiChat`, `GoogleGeminiChat`, `AzureOpenAiChat` (for model implementations)
- `PsAiModelAttributes`, `YpGroupPrivateAccessConfiguration`, `PsCallModelOptions`, `PsModelMessage` (for type definitions)
- `PolicySynthAgentBase` (base class for agent managers)
