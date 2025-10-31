# AzureOpenAiChat

A class for interacting with Azure OpenAI's chat completion API, supporting both streaming and non-streaming chat completions. This class extends `BaseChatModel` and is designed to work with Azure OpenAI deployments using Azure Active Directory authentication.

## Properties

| Name            | Type                        | Description                                                                                 |
|-----------------|----------------------------|---------------------------------------------------------------------------------------------|
| client          | `AzureOpenAI`              | The Azure OpenAI client instance used for making API calls.                                  |
| deploymentName  | `string`                   | The Azure OpenAI deployment name to use for completions.                                     |
| reasoningEffort | `'low' \| 'medium' \| 'high'` | The reasoning effort level for the model (default: `'medium'`).                             |
| temperature     | `number`                   | The temperature setting for the model's output randomness (default: `0.7`).                  |
| maxTokensOut    | `number` (inherited)       | The maximum number of tokens to generate in the response (from `BaseChatModel`).             |
| modelName       | `string` (inherited)       | The model name (from `BaseChatModel`).                                                       |

## Constructor

### `constructor(config: PsAzureAiModelConfig)`

Creates a new instance of `AzureOpenAiChat`.

- **Parameters:**
  - `config`: `PsAzureAiModelConfig`  
    The configuration object for the Azure OpenAI model, including deployment name, model name, temperature, and reasoning effort.

- **Behavior:**
  - Initializes the Azure OpenAI client with Azure AD credentials.
  - Sets up deployment name, reasoning effort, and temperature.

## Methods

| Name                                   | Parameters                                                                                                                                                                                                 | Return Type                | Description                                                                                                 |
|---------------------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| `generate`                             | `messages: PsModelMessage[]`,<br>`streaming?: boolean`,<br>`streamingCallback?: (chunk: string) => void`,<br>`media?: { mimeType: string; data: string }[]`                                                | `Promise<any>`             | Sends chat messages to Azure OpenAI and returns the response. Supports both streaming and non-streaming.     |
| `getEstimatedNumTokensFromMessages`     | `messages: PsModelMessage[]`                                                                                                                                                                              | `Promise<number>`          | Estimates the number of tokens in the provided messages using the Tiktoken encoder for the model.            |

### Method Details

#### `async generate(messages, streaming?, streamingCallback?, media?)`

- **Parameters:**
  - `messages`: `PsModelMessage[]`  
    Array of chat messages to send to the model.
  - `streaming`: `boolean` (optional)  
    If `true`, enables streaming responses.
  - `streamingCallback`: `(chunk: string) => void` (optional)  
    Callback function to handle streamed chunks of the response.
  - `media`: `{ mimeType: string; data: string }[]` (optional)  
    Media attachments (currently not used in the implementation).

- **Returns:**  
  - If `streaming` is `true`, returns `void` (calls the callback for each chunk).
  - If `streaming` is `false` or omitted, returns a `Promise` resolving to an object:
    ```typescript
    {
      tokensIn: number;
      tokensOut: number;
      content: string;
    }
    ```

- **Behavior:**
  - Maps `PsModelMessage` objects to the format expected by Azure OpenAI.
  - Handles tool calls and names if present.
  - For streaming, iterates over streamed events and calls the callback with each content chunk.
  - For non-streaming, returns the full response content and token usage.

#### `async getEstimatedNumTokensFromMessages(messages)`

- **Parameters:**
  - `messages`: `PsModelMessage[]`  
    Array of chat messages.

- **Returns:**  
  - `Promise<number>`: The estimated total number of tokens in all messages.

- **Behavior:**
  - Uses the `tiktoken` encoder for the model to count tokens in each message.
  - Sums the token counts for all messages.

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/aiModels/azureOpenAiChat.js';

const config = {
  endpoint: "https://your-azure-openai-endpoint.openai.azure.com/",
  apiKey: "YOUR_AZURE_OPENAI_API_KEY",
  deploymentName: "gpt-4-deployment",
  modelName: "gpt-4",
  maxTokensOut: 1024,
  reasoningEffort: "medium",
  temperature: 0.7,
  prices: {
    costInTokensPerMillion: 10,
    costOutTokensPerMillion: 20,
    costInCachedContextTokensPerMillion: 5,
    currency: "USD"
  }
};

const chatModel = new AzureOpenAiChat(config);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What's the weather like in Paris today?" }
];

// Non-streaming usage
const result = await chatModel.generate(messages);
console.log(result.content);

// Streaming usage
await chatModel.generate(
  messages,
  true,
  (chunk) => {
    process.stdout.write(chunk);
  }
);

// Estimate token usage
const estimatedTokens = await chatModel.getEstimatedNumTokensFromMessages(messages);
console.log(`Estimated tokens: ${estimatedTokens}`);
```

---

**Note:**  
- The `model` parameter is set to an empty string `""` in the API call, as required by Azure OpenAI deployments.
- The class requires Azure AD authentication and a valid Azure OpenAI deployment.
- The `media` parameter is present for future extensibility but is not currently used in the implementation.