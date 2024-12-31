# AzureOpenAiChat

The `AzureOpenAiChat` class is a specialized chat model that integrates with Azure's OpenAI service. It extends the `BaseChatModel` and provides functionality to generate chat completions using Azure's OpenAI API. This class supports both streaming and non-streaming scenarios for generating chat responses.

## Properties

| Name            | Type                  | Description                                                                 |
|-----------------|-----------------------|-----------------------------------------------------------------------------|
| client          | AzureOpenAI           | An instance of the AzureOpenAI client used to interact with the Azure API.  |
| deploymentName  | string                | The name of the deployment used for the Azure OpenAI service.               |
| reasoningEffort | 'low' \| 'medium' \| 'high' | The level of reasoning effort to be used by the model. Default is 'medium'. |
| temperature     | number                | The temperature setting for the model, affecting randomness. Default is 0.7.|

## Constructor

### AzureOpenAiChat(config: PsAzureAiModelConfig)

Creates an instance of the `AzureOpenAiChat` class.

#### Parameters

- `config`: `PsAzureAiModelConfig`
  - `endpoint`: `string` - The endpoint for the Azure OpenAI service.
  - `apiKey`: `string` - The API key for authentication.
  - `deploymentName`: `string` - The name of the deployment.
  - `modelName`: `string` (optional) - The name of the model. Defaults to "gpt-4".
  - `maxTokensOut`: `number` (optional) - The maximum number of tokens for output. Defaults to 4096.
  - `reasoningEffort`: `'low' | 'medium' | 'high'` (optional) - The reasoning effort level. Defaults to 'medium'.
  - `temperature`: `number` (optional) - The temperature setting. Defaults to 0.7.

## Methods

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void)

Generates chat completions based on the provided messages. Supports both streaming and non-streaming scenarios.

#### Parameters

- `messages`: `PsModelMessage[]` - An array of messages to be processed by the model.
- `streaming`: `boolean` (optional) - If true, enables streaming mode. Defaults to false.
- `streamingCallback`: `(chunk: string) => void` (optional) - A callback function to handle streaming chunks.

#### Returns

- `Promise<{ tokensIn: number; tokensOut: number; content: string; } | void>` - Returns an object containing token usage and content for non-streaming mode, or void for streaming mode.

### getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>

Estimates the number of tokens required for the given messages.

#### Parameters

- `messages`: `PsModelMessage[]` - An array of messages to estimate token usage for.

#### Returns

- `Promise<number>` - The estimated number of tokens.

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/aiModels/azureOpenAiChat.js';

const config = {
  endpoint: "https://your-endpoint.cognitiveservices.azure.com/",
  apiKey: "your-api-key",
  deploymentName: "your-deployment-name",
  modelName: "gpt-4",
  maxTokensOut: 4096,
  reasoningEffort: 'medium',
  temperature: 0.7
};

const chatModel = new AzureOpenAiChat(config);

const messages = [
  { role: "user", message: "Hello, how are you?" },
  { role: "assistant", message: "I'm good, thank you!" }
];

chatModel.generate(messages).then(response => {
  console.log(response.content);
});
```

This example demonstrates how to instantiate the `AzureOpenAiChat` class and generate a chat response using the Azure OpenAI service.