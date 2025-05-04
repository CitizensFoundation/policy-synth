# AzureOpenAiChat

A class for interacting with Azure OpenAI's Chat API, supporting both streaming and non-streaming chat completions. This class extends `BaseChatModel` and is designed to work with Azure's authentication and deployment model.

**File:** `@policysynth/agents/aiModels/azureOpenAiChat.js`

## Properties

| Name            | Type                        | Description                                                                                 |
|-----------------|----------------------------|---------------------------------------------------------------------------------------------|
| client          | `AzureOpenAI`              | The Azure OpenAI client instance used to make API calls.                                    |
| deploymentName  | `string`                   | The Azure OpenAI deployment name used for chat completions.                                 |
| reasoningEffort | `'low' \| 'medium' \| 'high'` | The reasoning effort level for the model (default: `'medium'`).                             |
| temperature     | `number`                   | The temperature parameter for the model's output randomness (default: `0.7`).               |
| modelName       | `string`                   | (Inherited) The model name (e.g., "gpt-4").                                                 |
| maxTokensOut    | `number`                   | (Inherited) The maximum number of tokens for output.                                        |

## Constructor

### `constructor(config: PsAzureAiModelConfig)`

Creates a new instance of `AzureOpenAiChat`.

- **Parameters:**
  - `config` (`PsAzureAiModelConfig`): Configuration object for Azure OpenAI, including endpoint, apiKey, deploymentName, modelName, maxTokensOut, reasoningEffort, and temperature.

- **Behavior:**
  - Sets up Azure AD authentication using `DefaultAzureCredential`.
  - Initializes the Azure OpenAI client with the provided deployment and API version.
  - Sets reasoning effort and temperature from config or defaults.

## Methods

| Name                                 | Parameters                                                                                                                                         | Return Type                | Description                                                                                                 |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| `generate`                           | `messages: PsModelMessage[]`, `streaming?: boolean`, `streamingCallback?: (chunk: string) => void`                                                 | `Promise<object \| void>`  | Generates a chat completion. Supports both streaming and non-streaming. Returns tokens in/out and content.  |
| `getEstimatedNumTokensFromMessages`  | `messages: PsModelMessage[]`                                                                                                                       | `Promise<number>`          | Estimates the number of tokens in the provided messages using the model's tokenizer.                        |

### Method Details

#### `async generate(messages, streaming?, streamingCallback?)`

- **Parameters:**
  - `messages`: Array of chat messages (`PsModelMessage[]`), each with a `role` and `message`.
  - `streaming`: (Optional) If `true`, enables streaming responses.
  - `streamingCallback`: (Optional) Callback function called with each streamed chunk of content.

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
  - Maps `PsModelMessage` to the format expected by Azure OpenAI.
  - For streaming, iterates over streamed events and calls the callback with each content delta.
  - For non-streaming, returns the full response content and token usage.

#### `async getEstimatedNumTokensFromMessages(messages)`

- **Parameters:**
  - `messages`: Array of chat messages (`PsModelMessage[]`).

- **Returns:**
  - `Promise<number>`: The estimated total number of tokens in all messages.

- **Behavior:**
  - Uses the `tiktoken` library to encode each message and sum their token counts.

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/aiModels/azureOpenAiChat.js';

const config = {
  endpoint: "https://your-azure-openai-endpoint.openai.azure.com/",
  apiKey: "YOUR_AZURE_OPENAI_API_KEY",
  deploymentName: "gpt-4-deployment",
  modelName: "gpt-4",
  maxTokensOut: 2048,
  reasoningEffort: "high",
  temperature: 0.5
};

const chatModel = new AzureOpenAiChat(config);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What's the weather like in Paris?" }
];

// Non-streaming usage
const result = await chatModel.generate(messages);
console.log(result.content); // Full response
console.log(`Tokens in: ${result.tokensIn}, Tokens out: ${result.tokensOut}`);

// Streaming usage
await chatModel.generate(messages, true, (chunk) => {
  process.stdout.write(chunk); // Streamed output
});

// Estimate token usage
const estimatedTokens = await chatModel.getEstimatedNumTokensFromMessages(messages);
console.log(`Estimated tokens: ${estimatedTokens}`);
```

---

**Note:**  
- The `model` parameter is set to an empty string `""` for Azure deployments, as required by the Azure OpenAI API.
- Azure AD authentication is handled automatically using `DefaultAzureCredential`.
- The class supports both streaming and non-streaming chat completions.
