# GoogleGeminiChat

A class for interacting with Google's Gemini AI chat models, providing both streaming and non-streaming chat completions, tool/function calling, and token usage logging. This class is designed to be used as a drop-in replacement for OpenAI-style chat models, with support for Google Gemini's specific API features.

**File:** `@policysynth/agents/aiModels/googleGeminiChat.js`

## Inheritance

- **Extends:** `BaseChatModel`

## Properties

| Name         | Type         | Description                                                                                 |
|--------------|--------------|---------------------------------------------------------------------------------------------|
| ai           | GoogleGenAI  | Instance of the GoogleGenAI client, configured for either Vertex AI or API key usage.        |
| modelName    | string       | The name of the Gemini model being used (e.g., "gemini-2.0-flash").                         |
| safetySettings | object[]   | Static. Array of safety settings for harm categories and block thresholds.                   |

## Constructor

```typescript
constructor(config: PsAiModelConfig)
```

- **config**: `PsAiModelConfig`  
  The configuration object for the AI model, including API key, model name, and other options.

**Behavior:**  
Initializes the Gemini client, choosing between Vertex AI and API key authentication based on environment variables. Sets the model name and maximum output tokens.

## Methods

| Name                    | Parameters                                                                                                                                                                                                                                    | Return Type                        | Description                                                                                                   |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|---------------------------------------------------------------------------------------------------------------|
| buildContents           | messages: PsModelMessage[], media?: { mimeType: string; data: string }[]                                                                                                                               | GenerateContentParameters["contents"] | Helper. Converts chat messages and optional media into Gemini's content format.                               |
| tokensOut               | usage?: any                                                                                                                                                                                            | number                              | Helper. Calculates the number of output tokens from Gemini's usage metadata.                                  |
| logTokens               | tokensIn: number, tokensOut: number, cached: number                                                                                                                                                    | Promise<void>                       | Helper. Logs token usage to a CSV file if debugging is enabled.                                               |
| assertGeminiNotBlocked  | response: GenerateContentResponse                                                                                                                                                                      | void                                | Throws an error if Gemini blocks the prompt or response for safety or other reasons.                          |
| generate                | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void, media?: { mimeType: string; data: string }[], tools?: ChatCompletionTool[], toolChoice?: ChatCompletionToolChoiceOption \| "auto", allowedTools?: string[] | Promise<PsBaseModelReturnParameters> | Main entry point. Sends chat messages to Gemini, with support for streaming, tool calling, and media input.   |

---

### Method Details

#### buildContents

```typescript
private buildContents(
  messages: PsModelMessage[],
  media?: { mimeType: string; data: string }[]
): GenerateContentParameters["contents"]
```
- Converts an array of chat messages and optional media into the format required by Gemini's API.
- Skips "system" and "developer" roles (handled via systemInstruction).
- Adds media as user parts.

#### tokensOut

```typescript
private tokensOut(usage?: any): number
```
- Calculates the number of output tokens from Gemini's usage metadata, handling different possible fields.

#### logTokens

```typescript
private async logTokens(tokensIn: number, tokensOut: number, cached: number): Promise<void>
```
- If the environment variable `DEBUG_TOKENS_COUNTS_TO_CSV_FILE` is set, appends token usage to `/tmp/geminiTokenDebug.csv`.

#### assertGeminiNotBlocked

```typescript
assertGeminiNotBlocked(response: GenerateContentResponse): void
```
- Throws an error if the Gemini API response indicates the prompt or candidate was blocked for safety or other reasons.

#### generate

```typescript
async generate(
  messages: PsModelMessage[],
  streaming?: boolean,
  streamingCallback?: (chunk: string) => void,
  media?: { mimeType: string; data: string }[],
  tools?: ChatCompletionTool[],
  toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
  allowedTools?: string[]
): Promise<PsBaseModelReturnParameters>
```
- **messages**: Array of chat messages (role, message, etc.).
- **streaming**: If true, uses Gemini's streaming API and calls `streamingCallback` for each chunk.
- **streamingCallback**: Function to call with each streamed text chunk.
- **media**: Optional array of media (images, etc.) to include in the prompt.
- **tools**: Optional array of function/tool definitions (OpenAI-style).
- **toolChoice**: Tool selection mode ("auto", "none", or a specific function).
- **allowedTools**: List of allowed tool names.

**Returns:**  
A promise resolving to a `PsBaseModelReturnParameters` object, including the generated content, token usage, and any tool calls.

**Behavior:**
- Handles system instructions, tool/function declarations, and safety settings.
- Supports both streaming and non-streaming completions.
- Handles Gemini-specific function calling and tool configuration.
- Logs token usage if enabled.

---

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/aiModels/googleGeminiChat.js';

const config = {
  apiKey: 'YOUR_GOOGLE_API_KEY',
  modelName: 'gemini-2.0-flash',
  maxTokensOut: 4096,
  // ...other PsAiModelConfig fields
};

const gemini = new GoogleGeminiChat(config);

const messages = [
  { role: 'user', message: 'Hello, Gemini!' }
];

(async () => {
  const result = await gemini.generate(messages);
  console.log(result.content); // Output from Gemini
})();
```

---

## Types Used

- `PsAiModelConfig`
- `PsModelMessage`
- `PsBaseModelReturnParameters`
- `ChatCompletionTool`
- `ChatCompletionToolChoiceOption`
- `GenerateContentParameters`
- `GenerateContentResponse`
- `FunctionDeclaration`
- `FunctionCall`
- `ToolConfig`
- `HarmBlockThreshold`
- `HarmCategory`

---

## Notes

- The class is designed to be compatible with OpenAI-style chat interfaces, but uses Google's Gemini API under the hood.
- Supports function/tool calling, system instructions, and media input.
- Handles safety settings and prompt/response blocking as per Gemini's requirements.
- Token usage can be logged for debugging and cost tracking.
- Streaming and non-streaming completions are both supported.
