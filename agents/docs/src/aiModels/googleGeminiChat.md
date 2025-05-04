# GoogleGeminiChat

A unified chat model class for interacting with Google's Gemini models, supporting both the [Google Generative AI API](https://ai.google.dev/) and [Google Cloud Vertex AI Gemini](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview). This class abstracts the differences between the two APIs, providing a consistent interface for chat-based generative tasks, including streaming and non-streaming responses.

## Properties

| Name             | Type                                                        | Description                                                                                  |
|------------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| useVertexAi      | `boolean`                                                   | Whether to use Vertex AI (`true`) or Google Generative AI API (`false`).                     |
| googleAiClient   | `GoogleGenerativeAI \| undefined`                           | Instance of the Google Generative AI client (if used).                                       |
| vertexAiClient   | `VertexAI \| undefined`                                     | Instance of the Vertex AI client (if used).                                                  |
| modelName        | `string`                                                    | The name of the Gemini model to use (e.g., `"gemini-pro"`).                                  |
| vertexProjectId  | `string \| undefined`                                       | Google Cloud Project ID for Vertex AI (if used).                                             |
| vertexLocation   | `string \| undefined`                                       | Google Cloud location for Vertex AI (if used).                                               |
| model            | `GoogleAiGenerativeModel \| VertexAiGenerativeModel`        | The underlying model instance, set after initialization.                                     |

## Static Properties

| Name                                 | Type      | Description                                                                                 |
|-------------------------------------- |-----------|---------------------------------------------------------------------------------------------|
| vertexSafetySettingsBlockNone         | `object[]`| Vertex AI safety settings that block no content (all thresholds set to `BLOCK_NONE`).        |
| generativeAiSafetySettingsBlockNone   | `object[]`| Google Generative AI API safety settings that block no content (all thresholds `BLOCK_NONE`).|

## Constructor

### `constructor(config: PsAiModelConfig)`

Creates a new `GoogleGeminiChat` instance.

- **Parameters:**
  - `config`: [`PsAiModelConfig`](#) — Model configuration, including `apiKey`, `modelName`, `maxTokensOut`, etc.

- **Throws:**  
  - If required environment variables or API keys are missing.

## Methods

| Name         | Parameters                                                                                                                                         | Return Type         | Description                                                                                                   |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------|
| generate     | `messages: PsModelMessage[]`,<br>`streaming?: boolean`,<br>`streamingCallback?: (chunk: string) => void`                                            | `Promise<{ tokensIn: number; tokensOut: number; content: string }>` | Generates a response from the Gemini model, supporting both streaming and non-streaming modes.                |
| buildVertexContents (private) | `messages: PsModelMessage[]`                                                                                                      | `Content[]`         | Converts chat messages to Vertex AI's content format (internal use).                                          |

### `async generate(messages, streaming?, streamingCallback?)`

Generates a chat completion from the Gemini model.

- **Parameters:**
  - `messages`: `PsModelMessage[]` — Array of chat messages (role: `"system"`, `"user"`, `"assistant"`, `"developer"`).
  - `streaming`: `boolean` (optional) — If `true`, enables streaming responses.
  - `streamingCallback`: `(chunk: string) => void` (optional) — Callback for streaming chunks.

- **Returns:**  
  `Promise<{ tokensIn: number; tokensOut: number; content: string }>`  
  - `tokensIn`: Number of prompt tokens used (if available).
  - `tokensOut`: Number of output tokens generated (if available).
  - `content`: The generated text content.

- **Throws:**  
  - If the model is not initialized correctly or if required configuration is missing.

#### Streaming Mode

- If `streaming` is `true`, the method streams the response, calling `streamingCallback` for each chunk.
- Returns the aggregated content and placeholder token counts (as streaming APIs may not provide token usage).

#### Non-Streaming Mode

- Returns the full response content and token usage (if available).

### `private buildVertexContents(messages: PsModelMessage[]): Content[]`

Converts an array of `PsModelMessage` objects into the format required by Vertex AI's `generateContent` API.

- Skips `"system"` and `"developer"` roles (handled as system instructions).
- Maps `"assistant"` role to `"model"` and `"user"` to `"user"`.

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/aiModels/googleGeminiChat.js';

const config = {
  apiKey: process.env.GOOGLE_API_KEY, // For Google Generative AI API
  modelName: "gemini-pro",
  maxTokensOut: 2048,
  // ...other PsAiModelConfig fields
};

const chatModel = new GoogleGeminiChat(config);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What's the weather like in Reykjavik today?" }
];

// Non-streaming usage
const result = await chatModel.generate(messages);
console.log(result.content);

// Streaming usage
await chatModel.generate(messages, true, (chunk) => {
  process.stdout.write(chunk);
});
```

## Notes

- The class automatically chooses between Vertex AI and Google Generative AI API based on environment variables and model name.
- Safety settings are set to allow all content by default (no blocking).
- System and developer messages are combined and passed as system instructions to the model.
- Handles both single-turn and multi-turn chat scenarios.
- Token usage reporting is best-effort and may be zero in streaming mode.

---

**See also:**  
- [`PsAiModelConfig`](#)  
- [`PsModelMessage`](#)  
- [Google Generative AI API Docs](https://ai.google.dev/)  
- [Vertex AI Gemini Docs](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview)
