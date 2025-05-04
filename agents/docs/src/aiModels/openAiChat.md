# OpenAiChat

A class for interacting with OpenAI's chat models, providing both streaming and non-streaming completions, as well as token estimation for prompt messages. This class extends `BaseChatModel` and is designed to be used as a backend for AI chat agents in the PolicySynth Agents framework.

**File:** `@policysynth/agents/aiModels/openAiChat.js`

---

## Properties

| Name         | Type                  | Description                                                                                  |
|--------------|-----------------------|----------------------------------------------------------------------------------------------|
| client       | OpenAI                | The OpenAI API client instance.                                                              |
| modelConfig  | PsOpenAiModelConfig   | The configuration object for the OpenAI model, including API key, model name, and parameters.|

---

## Constructor

### `constructor(config: PsOpenAiModelConfig)`

Creates a new instance of `OpenAiChat`.

- **Parameters:**
  - `config` (`PsOpenAiModelConfig`): The configuration for the OpenAI model, including API key, model name, max tokens, temperature, etc.

**Behavior:**
- Uses the provided API key, or falls back to the `PS_AGENT_OPENAI_API_KEY` environment variable if set.
- Initializes the OpenAI client and stores the model configuration.

---

## Methods

| Name                                 | Parameters                                                                                                    | Return Type | Description                                                                                                   |
|-------------------------------------- |---------------------------------------------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------|
| `generate`                           | `messages: PsModelMessage[]`, `streaming?: boolean`, `streamingCallback?: Function`                           | `Promise<any>` | Generates a chat completion from OpenAI. Supports both streaming and non-streaming modes.                     |
| `getEstimatedNumTokensFromMessages`   | `messages: PsModelMessage[]`                                                                                  | `Promise<number>` | Estimates the number of tokens in the provided messages for the current model.                                |

---

### Method Details

#### `async generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>`

Generates a chat completion using the OpenAI API.

- **Parameters:**
  - `messages`: Array of chat messages (`PsModelMessage[]`) to send to the model.
  - `streaming`: (Optional) If `true`, uses OpenAI's streaming API and calls `streamingCallback` for each token.
  - `streamingCallback`: (Optional) Function to call with each streamed token.

- **Returns:**  
  - If `streaming` is `true`, returns `void` (results are sent via callback).
  - If `streaming` is `false` or omitted, returns an object:
    ```typescript
    {
      tokensIn: number,         // Adjusted input tokens (with cache discount)
      tokensOut: number,        // Output tokens
      cacheRatio: number,       // % of input tokens that were cached
      content: string,          // The generated content
    }
    ```

- **Behavior:**
  - Converts messages to OpenAI's expected format.
  - Handles special logic for "small" models (e.g., "o1 mini") and system messages.
  - Logs debug information if enabled.
  - For streaming, emits each token to the callback.
  - For non-streaming, returns the full response and token usage details.

---

#### `async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>`

Estimates the number of tokens that the given messages will consume for the current model.

- **Parameters:**
  - `messages`: Array of chat messages (`PsModelMessage[]`).

- **Returns:**  
  - `Promise<number>`: The estimated total number of tokens.

- **Behavior:**
  - Uses the `tiktoken` library to encode each message and sum their token counts.

---

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/aiModels/openAiChat.js';

const config = {
  apiKey: 'sk-...',
  modelName: 'gpt-4o',
  maxTokensOut: 4096,
  temperature: 0.7,
  modelType: 'textReasoning', // PsAiModelType.TextReasoning
  modelSize: 'large',         // PsAiModelSize.Large
  reasoningEffort: 'medium'
};

const openAiChat = new OpenAiChat(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the capital of France?' }
];

// Non-streaming usage
const result = await openAiChat.generate(messages);
console.log(result.content); // "The capital of France is Paris."

// Streaming usage
await openAiChat.generate(messages, true, (token) => {
  process.stdout.write(token);
});

// Estimate tokens
const tokenCount = await openAiChat.getEstimatedNumTokensFromMessages(messages);
console.log(`Estimated tokens: ${tokenCount}`);
```

---

## Notes

- The class supports both streaming and non-streaming completions.
- Special handling is included for "small" OpenAI models (e.g., "o1 mini") to optimize prompt formatting.
- Token usage is adjusted to account for cached context tokens (with a 50% discount).
- Debug logging is available and can be enabled via environment variables.
- The class is intended for use as a backend for agent-based chat systems in PolicySynth.

---

**See also:**  
- [`BaseChatModel`](./baseChatModel.js)
- [`PsOpenAiModelConfig`](../aiModelTypes.js)
- [`PsModelMessage`](see AllTypeDefsUsedInProject)
