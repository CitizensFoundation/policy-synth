# PsAiModelManager

The `PsAiModelManager` class is responsible for managing AI models, including initializing models, calling different types of models, and tracking token usage. It extends the `PolicySynthAgentBase` class.

## Properties

| Name                  | Type                                | Description                                                                 |
|-----------------------|-------------------------------------|-----------------------------------------------------------------------------|
| models                | Map<string, BaseChatModel>          | A map of model keys to their corresponding `BaseChatModel` instances.       |
| modelsByType          | Map<PsAiModelType, BaseChatModel>   | A map of model types to their corresponding `BaseChatModel` instances.      |
| modelIds              | Map<string, number>                 | A map of model keys to their corresponding model IDs.                       |
| modelIdsByType        | Map<PsAiModelType, number>          | A map of model types to their corresponding model IDs.                      |
| rateLimits            | PsModelRateLimitTracking            | An object tracking rate limits for different models.                        |
| userId                | number                              | The ID of the user associated with the model manager.                       |
| agentId               | number                              | The ID of the agent associated with the model manager.                      |
| maxModelTokensOut     | number                              | The maximum number of tokens that can be output by a model.                 |
| modelTemperature      | number                              | The temperature setting for the models, affecting randomness in output.     |
| limitedLLMmaxRetryCount | number                            | The maximum number of retries for limited LLM calls.                        |
| mainLLMmaxRetryCount  | number                              | The maximum number of retries for main LLM calls.                           |

## Methods

| Name                | Parameters                                                                 | Return Type          | Description                                                                 |
|---------------------|---------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor         | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut: number, modelTemperature: number, agentId: number, userId: number | void                 | Initializes the `PsAiModelManager` with the given parameters.               |
| initializeModels    | aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[] | void                 | Initializes the models based on the provided configurations.                |
| callModel           | modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Function | Promise<any>         | Calls the appropriate model based on the type and size.                     |
| callTextModel       | modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Function | Promise<any>         | Calls a text model and handles retries and token usage tracking.            |
| callEmbeddingModel  | messages: PsModelMessage[]                                                | Promise<any>         | Placeholder for calling an embedding model.                                 |
| callMultiModalModel | messages: PsModelMessage[]                                                | Promise<any>         | Placeholder for calling a multi-modal model.                                |
| callAudioModel      | messages: PsModelMessage[]                                                | Promise<any>         | Placeholder for calling an audio model.                                     |
| callVideoModel      | messages: PsModelMessage[]                                                | Promise<any>         | Placeholder for calling a video model.                                      |
| callImageModel      | messages: PsModelMessage[]                                                | Promise<any>         | Placeholder for calling an image model.                                     |
| saveTokenUsage      | modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number | Promise<void>        | Saves the token usage for a model in the database.                          |
| getTokensFromMessages | messages: PsModelMessage[]                                              | Promise<number>      | Calculates the number of tokens used in the given messages.                 |

## Example

```typescript
import { PsAiModelManager } from '@policysynth/agents/base/agentModelManager.js';
import { PsAiModelAttributes, YpGroupPrivateAccessConfiguration } from '../types';

const aiModels: PsAiModelAttributes[] = [/* ... */];
const accessConfiguration: YpGroupPrivateAccessConfiguration[] = [/* ... */];
const maxModelTokensOut = 4096;
const modelTemperature = 0.7;
const agentId = 1;
const userId = 1;

const modelManager = new PsAiModelManager(
  aiModels,
  accessConfiguration,
  maxModelTokensOut,
  modelTemperature,
  agentId,
  userId
);

const messages = [
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