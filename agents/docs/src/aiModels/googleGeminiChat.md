# GoogleGeminiChat

A chat model class for interacting with Google's Gemini (Generative AI) models, supporting both the [Google Generative AI API](https://ai.google.dev/) and [Google Vertex AI](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview). This class provides a unified interface for generating chat completions, with support for both streaming and non-streaming responses, token usage tracking, and safety settings.

## Properties

| Name              | Type                                                                 | Description                                                                                      |
|-------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| useVertexAi       | boolean                                                              | Indicates whether to use Vertex AI (`true`) or Google Generative AI API (`false`).               |
| googleAiClient    | GoogleGenerativeAI \| undefined                                      | Instance of the Google Generative AI client (if used).                                           |
| vertexAiClient    | VertexAI \| undefined                                                | Instance of the Vertex AI client (if used).                                                      |
| modelName         | string                                                               | The name of the model to use (e.g., `"gemini-pro"`).                                             |
| vertexProjectId   | string \| undefined                                                  | Google Cloud Project ID for Vertex AI.                                                           |
| vertexLocation    | string \| undefined                                                  | Google Cloud location for Vertex AI.                                                             |
| model             | GoogleAiGenerativeModel \| VertexAiGenerativeModel                   | The underlying model instance (either Google or Vertex).                                         |
| config (inherited)| PsAiModelConfig                                                      | Model configuration, including API key, model name, max tokens, etc.                             |
| logger (inherited)| any                                                                  | Logger instance for debug/info/error logging.                                                    |

## Static Properties

| Name                                 | Type    | Description                                                                                      |
|-------------------------------------- |---------|--------------------------------------------------------------------------------------------------|
| vertexSafetySettingsBlockNone         | Array   | Safety settings for Vertex AI to block no content categories.                                     |
| generativeAiSafetySettingsBlockNone   | Array   | Safety settings for Google Generative AI API to block no content categories.                      |

## Methods

| Name                | Parameters                                                                                                                                         | Return Type                              | Description                                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| constructor         | config: PsAiModelConfig                                                                                                                            | GoogleGeminiChat                         | Initializes the chat model, sets up the appropriate client (Vertex or Google), and validates configuration.   |
| buildVertexContents | messages: PsModelMessage[]                                                                                                                         | Content[]                                | Converts an array of chat messages into the format required by Vertex AI.                                     |
| debugTokenCounts    | tokensIn: number, tokensOut: number, cachedInTokens: number                                                                                        | Promise<void>                            | (Private) Logs token usage to a CSV file if debugging is enabled.                                             |
| generate            | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void                                                       | Promise<PsBaseModelReturnParameters \| undefined> | Generates a chat completion using the configured model. Supports both streaming and non-streaming modes.      |

## Method Details

### constructor(config: PsAiModelConfig)

Initializes the `GoogleGeminiChat` instance. Determines whether to use Vertex AI or Google Generative AI API based on environment variables and configures the appropriate client. Throws errors if required configuration is missing.

### buildVertexContents(messages: PsModelMessage[]): Content[]

Converts an array of chat messages (`PsModelMessage[]`) into the `Content[]` format required by Vertex AI, mapping roles appropriately.

### debugTokenCounts(tokensIn: number, tokensOut: number, cachedInTokens: number): Promise<void>

If the environment variable `DEBUG_TOKENS_COUNTS_TO_CSV_FILE` is set, logs token usage statistics to `/tmp/geminiTokenDebug.csv` for debugging and cost analysis.

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void): Promise<PsBaseModelReturnParameters | undefined>

Generates a chat completion using the configured model. Handles both streaming and non-streaming requests, and adapts the prompt/message format for the selected backend (Vertex AI or Google Generative AI API). Returns token usage statistics and the generated content.

- **messages**: Array of chat messages, including roles such as `"system"`, `"user"`, and `"assistant"`.
- **streaming**: If `true`, returns results as they are generated via the `streamingCallback`.
- **streamingCallback**: Function called with each chunk of generated text in streaming mode.

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/aiModels/googleGeminiChat.js';

const config = {
  apiKey: process.env.GOOGLE_API_KEY, // For Google Generative AI API
  modelName: "gemini-pro",
  maxTokensOut: 2048,
  prices: {
    costInTokensPerMillion: 1,
    costOutTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 1,
    currency: "USD"
  },
  modelType: "chat",
  modelSize: "medium"
};

const chatModel = new GoogleGeminiChat(config);

const messages = [
  { role: "system", message: "You are a helpful assistant." },
  { role: "user", message: "What's the weather like in Paris today?" }
];

(async () => {
  // Non-streaming example
  const result = await chatModel.generate(messages);
  console.log("Response:", result?.content);

  // Streaming example
  await chatModel.generate(messages, true, (chunk) => {
    process.stdout.write(chunk);
  });
})();
```

## Notes

- The class automatically chooses between Vertex AI and Google Generative AI API based on environment variables:
  - `USE_GOOGLE_VERTEX_AI` (set to `"true"` to use Vertex AI for all models)
  - `USE_GOOGLE_VERTEX_AI_FOR_MODELS` (comma-separated list of model names to use Vertex AI for)
  - `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` are required for Vertex AI.
- Safety settings are set to "block none" for all harm categories by default.
- Token usage is tracked and can be logged for debugging/cost analysis.
- The `generate` method supports both streaming and non-streaming completions.
- System and developer messages are handled as system instructions for the model.

---

**TypeScript Definitions Used:**
- `PsAiModelConfig`
- `PsModelMessage`
- `PsBaseModelReturnParameters`
- `Content` (from Vertex AI SDK)
- `GoogleGenerativeAI`, `GenerativeModel` (from Google Generative AI SDK)
- `VertexAI`, `GenerativeModel` (from Vertex AI SDK)

See the [AllTypeDefsUsedInProject] for more details on these types.