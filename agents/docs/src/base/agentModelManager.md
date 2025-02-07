# PsAiModelManager

The `PsAiModelManager` class is responsible for managing AI models, handling their initialization, and facilitating interactions with them. It supports various AI model types and sizes, and provides methods to call these models for different purposes such as text generation, embeddings, and more.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| models                | Map<string, BaseChatModel>                | A map of model keys to their corresponding `BaseChatModel` instances.       |
| modelsByType          | Map<PsAiModelType, BaseChatModel>         | A map of model types to their corresponding `BaseChatModel` instances.      |
| modelIds              | Map<string, number>                       | A map of model keys to their database IDs.                                  |
| modelIdsByType        | Map<PsAiModelType, number>                | A map of model types to their database IDs.                                 |
| rateLimits            | PsModelRateLimitTracking                  | An object tracking rate limits for models.                                  |
| userId                | number                                    | The ID of the user associated with this manager.                            |
| agentId               | number                                    | The ID of the agent associated with this manager.                           |
| maxModelTokensOut     | number                                    | The maximum number of tokens that can be output by a model.                 |
| modelTemperature      | number                                    | The temperature setting for model generation, affecting randomness.         |
| reasoningEffort       | "low" \| "medium" \| "high"               | The level of reasoning effort for model generation.                         |
| limitedLLMmaxRetryCount | number                                  | The maximum number of retries for limited LLM calls.                        |
| mainLLMmaxRetryCount  | number                                    | The maximum number of retries for main LLM calls.                           |

## Methods

| Name                          | Parameters                                                                 | Return Type          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                   | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut?: number, modelTemperature?: number, reasoningEffort?: "low" \| "medium" \| "high", agentId: number, userId: number | void                 | Initializes the `PsAiModelManager` with the given models and configurations.|
| initializeOneModelFromEnv     | -                                                                          | BaseChatModel \| undefined | Initializes a single model from environment variables.                      |
| initializeModels              | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[] | void                 | Initializes models based on the provided attributes and access configurations. |
| callModel                     | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any>         | Calls a model based on the specified type and size, with the given messages.|
| callTextModel                 | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any>         | Calls a text model with the specified parameters and handles retries.       |
| callEmbeddingModel            | messages: PsModelMessage[]                                                | Promise<null>        | Placeholder for calling an embedding model.                                 |
| callMultiModalModel           | messages: PsModelMessage[]                                                | Promise<null>        | Placeholder for calling a multi-modal model.                                |
| callAudioModel                | messages: PsModelMessage[]                                                | Promise<null>        | Placeholder for calling an audio model.                                     |
| callVideoModel                | messages: PsModelMessage[]                                                | Promise<null>        | Placeholder for calling a video model.                                      |
| callImageModel                | messages: PsModelMessage[]                                                | Promise<null>        | Placeholder for calling an image model.                                     |
| saveTokenUsage                | modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number | Promise<void>        | Saves the token usage for a model in the database.                          |
| getTokensFromMessages         | messages: PsModelMessage[]                                                | Promise<number>      | Calculates the number of tokens in the given messages.                      |

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';

const aiModels = [...]; // Array of PsAiModelAttributes
const accessConfig = [...]; // Array of YpGroupPrivateAccessConfiguration
const manager = new PsAiModelManager(aiModels, accessConfig, 4096, 0.7, "medium", 1, 1);

const messages = [
  { role: "user", message: "Hello, how are you?" }
];

manager.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

This example demonstrates how to initialize the `PsAiModelManager` with a set of AI models and access configurations, and how to call a text model with a simple message.