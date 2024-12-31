# PsAiModelManager

The `PsAiModelManager` class is responsible for managing AI models, initializing them based on configurations, and handling model calls for various AI tasks such as text generation, embeddings, and more. It extends the `PolicySynthAgentBase` class.

## Properties

| Name                  | Type                                  | Description                                                                 |
|-----------------------|---------------------------------------|-----------------------------------------------------------------------------|
| models                | Map<string, BaseChatModel>            | A map of model keys to their corresponding `BaseChatModel` instances.       |
| modelsByType          | Map<PsAiModelType, BaseChatModel>     | A map of model types to their corresponding `BaseChatModel` instances.      |
| modelIds              | Map<string, number>                   | A map of model keys to their database IDs.                                  |
| modelIdsByType        | Map<PsAiModelType, number>            | A map of model types to their database IDs.                                 |
| rateLimits            | PsModelRateLimitTracking              | An object tracking rate limits for models.                                  |
| userId                | number                                | The ID of the user associated with the model manager.                       |
| agentId               | number                                | The ID of the agent associated with the model manager.                      |
| maxModelTokensOut     | number                                | The maximum number of tokens that can be output by a model.                 |
| modelTemperature      | number                                | The temperature setting for model generation, affecting randomness.         |
| reasoningEffort       | 'low' \| 'medium' \| 'high'           | The level of reasoning effort for the model.                                |
| limitedLLMmaxRetryCount | number                              | The maximum number of retries for limited LLM calls.                        |
| mainLLMmaxRetryCount  | number                                | The maximum number of retries for main LLM calls.                           |

## Methods

| Name                          | Parameters                                                                 | Return Type | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor                   | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut?: number, modelTemperature?: number, reasoningEffort?: 'low' \| 'medium' \| 'high', agentId: number, userId: number | void        | Initializes the model manager with given AI models and configurations.      |
| initializeOneModelFromEnv     | -                                                                          | BaseChatModel \| undefined | Initializes a single model from environment variables.                      |
| initializeModels              | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[] | void        | Initializes models based on provided configurations.                        |
| callModel                     | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any> | Calls the appropriate model based on type and size.                         |
| callTextModel                 | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function | Promise<any> | Handles calls to text models with retry logic and token usage tracking.     |
| callEmbeddingModel            | messages: PsModelMessage[]                                                | Promise<any> | Placeholder for embedding model call.                                       |
| callMultiModalModel           | messages: PsModelMessage[]                                                | Promise<any> | Placeholder for multi-modal model call.                                     |
| callAudioModel                | messages: PsModelMessage[]                                                | Promise<any> | Placeholder for audio model call.                                           |
| callVideoModel                | messages: PsModelMessage[]                                                | Promise<any> | Placeholder for video model call.                                           |
| callImageModel                | messages: PsModelMessage[]                                                | Promise<any> | Placeholder for image model call.                                           |
| saveTokenUsage                | modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number | Promise<void> | Saves token usage data to the database.                                     |
| getTokensFromMessages         | messages: PsModelMessage[]                                                | Promise<number> | Calculates the number of tokens in the given messages.                      |

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';

const aiModels = [...]; // Array of PsAiModelAttributes
const accessConfig = [...]; // Array of YpGroupPrivateAccessConfiguration
const manager = new PsAiModelManager(aiModels, accessConfig, 4096, 0.7, 'medium', 1, 1);

const messages = [
  { role: 'user', message: 'Hello, how are you?' }
];

manager.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

This example demonstrates how to initialize the `PsAiModelManager` with AI models and access configurations, and how to call a text model with a sample message.