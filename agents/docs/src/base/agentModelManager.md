# PsAiModelManager

The `PsAiModelManager` class is responsible for managing AI models, handling model calls, and tracking token usage. It supports various AI model providers and types, including text, embedding, multi-modal, audio, video, and image models.

## Properties

| Name                   | Type                                | Description                                                                 |
|------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| models                 | Map<string, BaseChatModel>          | A map of model keys to their corresponding `BaseChatModel` instances.       |
| modelsByType           | Map<PsAiModelType, BaseChatModel>   | A map of model types to their corresponding `BaseChatModel` instances.      |
| modelIds               | Map<string, number>                 | A map of model keys to their corresponding model IDs.                       |
| modelIdsByType         | Map<PsAiModelType, number>          | A map of model types to their corresponding model IDs.                      |
| rateLimits             | PsModelRateLimitTracking            | An object tracking rate limits for models.                                  |
| userId                 | number                              | The ID of the user associated with the model manager.                       |
| agentId                | number                              | The ID of the agent associated with the model manager.                      |
| maxModelTokensOut      | number                              | The maximum number of tokens that can be output by a model.                 |
| modelTemperature       | number                              | The temperature setting for the model, affecting randomness in output.      |
| limitedLLMmaxRetryCount| number                              | The maximum number of retries for limited LLM calls.                        |
| mainLLMmaxRetryCount   | number                              | The maximum number of retries for main LLM calls.                           |

## Methods

| Name                | Parameters                                                                 | Return Type       | Description                                                                 |
|---------------------|---------------------------------------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| constructor         | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut: number, modelTemperature: number, agentId: number, userId: number | void              | Initializes the `PsAiModelManager` with the provided AI models and configurations. |
| initializeModels    | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[] | void              | Initializes the models based on the provided configurations.                |
| callModel           | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Function | Promise<any>      | Calls the appropriate model based on the type and size.                     |
| callTextModel       | modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Function | Promise<any>      | Calls a text model and handles retries and token usage tracking.            |
| callEmbeddingModel  | messages: PsModelMessage[]                                                | Promise<any>      | Placeholder for embedding model call.                                       |
| callMultiModalModel | messages: PsModelMessage[]                                                | Promise<any>      | Placeholder for multi-modal model call.                                     |
| callAudioModel      | messages: PsModelMessage[]                                                | Promise<any>      | Placeholder for audio model call.                                           |
| callVideoModel      | messages: PsModelMessage[]                                                | Promise<any>      | Placeholder for video model call.                                           |
| callImageModel      | messages: PsModelMessage[]                                                | Promise<any>      | Placeholder for image model call.                                           |
| saveTokenUsage      | modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number | Promise<void>     | Saves the token usage for a model in the database.                          |
| getTokensFromMessages | messages: PsModelMessage[]                                              | Promise<number>   | Calculates the number of tokens in the provided messages.                   |

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';
import { PsAiModelAttributes, YpGroupPrivateAccessConfiguration, PsModelMessage, PsAiModelType, PsAiModelSize } from '../types';

const aiModels: PsAiModelAttributes[] = [/* ... */];
const accessConfiguration: YpGroupPrivateAccessConfiguration[] = [/* ... */];
const agentId = 1;
const userId = 1;

const modelManager = new PsAiModelManager(aiModels, accessConfiguration, 4096, 0.7, agentId, userId);

const messages: PsModelMessage[] = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' }
];

modelManager.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages)
  .then(response => {
    console.log('Model response:', response);
  })
  .catch(error => {
    console.error('Error calling model:', error);
  });
```