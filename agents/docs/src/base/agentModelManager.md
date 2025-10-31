# PsAiModelManager

The `PsAiModelManager` class is a central manager for handling multiple AI chat models (LLMs) in the PolicySynth agent framework. It supports dynamic model initialization, ephemeral overrides, fallback logic, token usage tracking, and price configuration retrieval. It is designed to work with various providers (OpenAI, Anthropic, Google, Azure) and supports both persistent and ephemeral (one-off) model instances.

**File:** `@policysynth/agents/base/agentModelManager.js`

---

## Properties

| Name                | Type                                         | Description                                                                                   |
|---------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| models              | `Map<string, BaseChatModel>`                 | Map of model keys (`type_size`) to model instances.                                           |
| modelsByType        | `Map<PsAiModelType, BaseChatModel>`          | Map of model types to model instances.                                                        |
| modelIds            | `Map<string, number>`                        | Map of model keys to their database IDs.                                                      |
| modelIdsByType      | `Map<PsAiModelType, number>`                 | Map of model types to their database IDs.                                                     |
| rateLimits          | `PsModelRateLimitTracking`                   | Tracks rate limits for each model.                                                            |
| userId              | `number`                                     | The user ID associated with this manager.                                                     |
| agentId             | `number`                                     | The agent ID associated with this manager.                                                    |
| maxTokensOut        | `number`                                     | Maximum output tokens for model calls.                                                        |
| modelTemperature    | `number`                                     | Temperature setting for model calls.                                                          |
| reasoningEffort     | `"low" \| "medium" \| "high"`                | Reasoning effort for model calls.                                                             |
| maxThinkingTokens   | `number`                                     | Maximum tokens for "thinking" (context window).                                               |
| limitedLLMmaxRetryCount | `number`                                 | Max retries for limited LLM calls.                                                            |
| mainLLMmaxRetryCount    | `number`                                 | Max retries for main LLM calls.                                                               |
| modelCallTimeoutMs  | `number`                                     | Timeout in milliseconds for model calls.                                                      |

---

## Methods

| Name                              | Parameters                                                                                                    | Return Type                                      | Description                                                                                                 |
|----------------------------------- |--------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                       | `aiModels, accessConfiguration, maxTokensOut, modelTemperature, reasoningEffort, maxThinkingTokens, agentId, userId` | `PsAiModelManager`                               | Initializes the manager with models and configuration.                                                      |
| initializeOneModelFromEnv         | none                                                                                                         | `BaseChatModel \| undefined`                     | Initializes a model from environment variables if no models are provided.                                   |
| initializeModels                  | `aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[]`                  | `void`                                           | Initializes all models from provided configuration and access keys.                                         |
| createEphemeralModel (private)    | `modelType, modelSize, options`                                                                              | `Promise<BaseChatModel \| undefined>`            | Creates a one-off ephemeral model instance, merging overrides from options.                                 |
| getApiKeyForProvider (private)    | `provider: string`                                                                                           | `string`                                         | Returns the API key for a given provider from environment variables.                                        |
| callModel                         | `modelType, modelSize, messages, options`                                                                    | `Promise<any>`                                   | Calls the appropriate model based on type (text, embedding, etc).                                           |
| callTextModel                     | `modelType, modelSize, messages, options`                                                                    | `Promise<any>`                                   | Calls a text model, handling ephemeral overrides and fallback logic.                                        |
| runTextModelCall (private)        | `model, modelType, modelSize, messages, options`                                                             | `Promise<any>`                                   | Executes the actual model call with retry, fallback, and error handling logic.                              |
| callWithTimeout (private)         | `model, messages, streamingCallbacks, timeoutMs, media, tools, toolChoice, allowedTools`                     | `Promise<PsBaseModelReturnParameters \| undefined>` | Calls the model with a timeout, supporting streaming and tool calls.                                        |
| sleepBeforeRetry (private)        | `retryCount: number`                                                                                         | `Promise<void>`                                  | Sleeps for a calculated time before retrying a failed call.                                                 |
| callEmbeddingModel                | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`                                   | Placeholder for embedding model calls (not implemented).                                                    |
| callMultiModalModel               | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`                                   | Placeholder for multi-modal model calls (not implemented).                                                  |
| callAudioModel                    | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`                                   | Placeholder for audio model calls (not implemented).                                                        |
| callVideoModel                    | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`                                   | Placeholder for video model calls (not implemented).                                                        |
| callImageModel                    | `messages: PsModelMessage[]`                                                                                  | `Promise<any>`                                   | Placeholder for image model calls (not implemented).                                                        |
| getModelPriceConfiguration        | `modelType, modelSize, options`                                                                              | `Promise<PsBaseModelPriceConfiguration \| undefined>` | Returns the price configuration for a given model call, considering ephemeral overrides and fallbacks.      |
| saveTokenUsage                    | `modelName, modelProvider, prices, modelType, modelSize, tokensIn, cachedInTokens, tokensOut, modelIdOverride?` | `Promise<void>`                                  | Saves token usage statistics to the database or emits an event if tracking is disabled.                     |
| getTokensFromMessages             | `messages: PsModelMessage[]`                                                                                  | `Promise<number>`                                | Calculates the number of tokens in a set of messages using Tiktoken.                                        |
| logDetailedServerError (private)  | `model, error, messages, retryCount`                                                                         | `void`                                           | Logs detailed information about server errors for debugging.                                                |

### Static Methods

| Name                        | Parameters         | Return Type | Description                                                                                 |
|-----------------------------|--------------------|-------------|---------------------------------------------------------------------------------------------|
| prohibitedContentErrors     | -                  | `string[]`  | List of error messages indicating prohibited content.                                        |
| isProhibitedContentError    | `err: any`         | `boolean`   | Checks if an error is due to prohibited content.                                             |
| isMissingParameterError     | `err: any`         | `boolean`   | Checks if an error is due to a missing parameter (400 error).                                |
| general400Error             | `err: any`         | `boolean`   | Checks if an error is a general 400 error.                                                   |

---

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';

// Example initialization
const aiModels = [/* Array of PsAiModelAttributes from DB or config */];
const accessConfig = [/* Array of YpGroupPrivateAccessConfiguration */];
const agentId = 123;
const userId = 456;

const modelManager = new PsAiModelManager(
  aiModels,
  accessConfig,
  4096,      // maxTokensOut
  0.7,       // modelTemperature
  "medium",  // reasoningEffort
  0,         // maxThinkingTokens
  agentId,
  userId
);

// Example model call
const messages = [
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
  console.log(response);
})();
```

---

## Notes

- **Ephemeral Model Support:** The manager can create one-off model instances for special requests, using overrides from the call options.
- **Fallback Logic:** If a model is unavailable or errors occur, the manager will attempt to use fallback models or providers.
- **Token Usage Tracking:** Token usage is tracked and can be persisted to a database or emitted as events.
- **Price Configuration:** The manager can retrieve the price configuration for any model, including ephemeral overrides.
- **Extensible:** The class is designed to be extended for additional model types (audio, video, image, etc.), though only text models are fully implemented.

---

## See Also

- `BaseChatModel`, `ClaudeChat`, `OpenAiChat`, `GoogleGeminiChat`, `AzureOpenAiChat`
- `PsAiModelAttributes`, `YpGroupPrivateAccessConfiguration`, `PsCallModelOptions`
- `TokenLimitChunker` for handling token limit errors and chunking logic

---

**This class is a core utility for managing and calling AI models in the PolicySynth agent ecosystem.**