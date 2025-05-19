# AzureOpenAiChat

A class for interacting with Azure OpenAI's chat completion API, supporting both streaming and non-streaming responses. This class extends `BaseChatModel` and is designed to work with Azure's authentication and deployment model.

## Properties

| Name            | Type                        | Description                                                                                 |
|-----------------|----------------------------|---------------------------------------------------------------------------------------------|
| client          | AzureOpenAI                 | The Azure OpenAI client instance used to make API calls.                                    |
| deploymentName  | string                      | The Azure OpenAI deployment name to use for completions.                                    |
| reasoningEffort | 'low' \| 'medium' \| 'high' | The reasoning effort level for the model (default: 'medium').                               |
| temperature     | number                      | The temperature parameter for the model, controlling randomness (default: 0.7).             |
| modelName       | string                      | (Inherited) The model name (e.g., "gpt-4").                                                 |
| maxTokensOut    | number                      | (Inherited) The maximum number of tokens to generate in the response (default: 4096).       |

## Constructor

### new AzureOpenAiChat(config: PsAzureAiModelConfig)

Creates a new instance of `AzureOpenAiChat`.

- **Parameters:**
  - `config` (`PsAzureAiModelConfig`): Configuration object for the Azure OpenAI model, including deployment name, API key, model name, max tokens, temperature, and reasoning effort.

## Methods

| Name                              | Parameters                                                                                                 | Return Type                                                                 | Description                                                                                      |
|------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| generate                          | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void               | Promise<{ tokensIn: number; tokensOut: number; content: string } \| void>   | Generates a chat completion. Supports both streaming and non-streaming modes.                    |
| getEstimatedNumTokensFromMessages  | messages: PsModelMessage[]                                                                                 | Promise<number>                                                             | Estimates the number of tokens that the given messages will consume using the Tiktoken encoder.   |

### generate

Generates a chat completion using the Azure OpenAI API.

- **Parameters:**
  - `messages` (`PsModelMessage[]`): An array of chat messages, each with a `role` and `message`.
  - `streaming` (`boolean`, optional): If `true`, uses streaming mode and calls `streamingCallback` for each chunk.
  - `streamingCallback` (`(chunk: string) => void`, optional): Callback function to handle streamed content chunks.

- **Returns:**
  - In non-streaming mode: A promise resolving to an object with `tokensIn`, `tokensOut`, and `content`.
  - In streaming mode: Returns `void` (calls the callback for each chunk).

### getEstimatedNumTokensFromMessages

Estimates the number of tokens that the provided messages will consume.

- **Parameters:**
  - `messages` (`PsModelMessage[]`): An array of chat messages.

- **Returns:**
  - A promise resolving to the estimated number of tokens (`number`).

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/aiModels/azureOpenAiChat.js';

const config = {
  endpoint: "https://your-azure-endpoint.openai.azure.com/",
  apiKey: "YOUR_AZURE_OPENAI_API_KEY",
  deploymentName: "gpt-4-deployment",
  modelName: "gpt-4",
  maxTokensOut: 1024,
  temperature: 0.5,
  reasoningEffort: "medium"
};

const chatModel = new AzureOpenAiChat(config);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What's the weather like in Paris?" }
];

// Non-streaming usage
const result = await chatModel.generate(messages);
console.log(result.content);

// Streaming usage
await chatModel.generate(messages, true, (chunk) => {
  process.stdout.write(chunk);
});

// Estimate token usage
const estimatedTokens = await chatModel.getEstimatedNumTokensFromMessages(messages);
console.log(`Estimated tokens: ${estimatedTokens}`);
```

---

**Note:**  
- The `model` parameter is required by the Azure OpenAI API, but for Azure deployments, it is set to an empty string (`""`) as the deployment name is used instead.
- The class uses Azure AD authentication via `DefaultAzureCredential` and `getBearerTokenProvider`.
- The `generate` method supports both streaming and non-streaming completions.
- The `getEstimatedNumTokensFromMessages` method uses the `tiktoken` library to estimate token usage.