# AzureOpenAiChat

The `AzureOpenAiChat` class is a specialized chat model that integrates with Azure OpenAI services. It extends the `BaseChatModel` and provides functionalities to generate chat completions and estimate token usage.

## Properties

| Name           | Type            | Description                                      |
|----------------|-----------------|--------------------------------------------------|
| client         | OpenAIClient    | The client instance for interacting with Azure OpenAI. |
| deploymentName | string          | The name of the deployment to use for chat completions. |

## Constructor

### AzureOpenAiChat(config: PsAzureAiModelConfig)

Creates an instance of `AzureOpenAiChat`.

| Parameter | Type                | Description                                      |
|-----------|---------------------|--------------------------------------------------|
| config    | PsAzureAiModelConfig | Configuration object for Azure OpenAI.           |

## Methods

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function)

Generates chat completions based on the provided messages.

| Parameter         | Type                | Description                                      |
|-------------------|---------------------|--------------------------------------------------|
| messages          | PsModelMessage[]    | Array of messages to generate completions for.   |
| streaming         | boolean             | Optional. If true, enables streaming mode.       |
| streamingCallback | Function            | Optional. Callback function for streaming mode.  |

**Returns:** 
- If `streaming` is false: `{ tokensIn: number, tokensOut: number, content: string }`
- If `streaming` is true: void

### getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>

Estimates the number of tokens required for the provided messages.

| Parameter | Type                | Description                                      |
|-----------|---------------------|--------------------------------------------------|
| messages  | PsModelMessage[]    | Array of messages to estimate token usage for.   |

**Returns:** `Promise<number>` - The estimated number of tokens.

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/aiModels/azureOpenAiChat.js';

const config = {
  apiKey: 'your-azure-api-key',
  endpoint: 'https://your-endpoint.openai.azure.com/',
  deploymentName: 'your-deployment-name',
  modelName: 'gpt-4o',
  maxTokensOut: 4096
};

const azureChat = new AzureOpenAiChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' }
];

azureChat.generate(messages).then(response => {
  console.log(response.content);
});

azureChat.getEstimatedNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Estimated tokens: ${tokenCount}`);
});
```

This example demonstrates how to create an instance of `AzureOpenAiChat`, generate chat completions, and estimate token usage.