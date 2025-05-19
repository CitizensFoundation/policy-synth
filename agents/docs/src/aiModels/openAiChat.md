# OpenAiChat

A class for interacting with OpenAI's chat models (such as GPT-4, GPT-4o, GPT-3.5, etc.) in a structured and configurable way. It extends the `BaseChatModel` and provides methods for generating completions (with or without streaming) and estimating token usage for a given set of messages.

**File:** `@policysynth/agents/aiModels/openAiChat.js`

## Properties

| Name         | Type                  | Description                                                                                  |
|--------------|-----------------------|----------------------------------------------------------------------------------------------|
| client       | OpenAI                | The OpenAI API client instance used to make requests.                                        |
| modelConfig  | PsOpenAiModelConfig   | The configuration object for the OpenAI model, including API key, model name, and parameters.|

## Constructor

```typescript
constructor(config: PsOpenAiModelConfig)
```

- **config**: `PsOpenAiModelConfig`  
  The configuration object for the OpenAI model, including API key, model name, temperature, max tokens, etc.

**Behavior:**
- If the environment variable `PS_AGENT_OPENAI_API_KEY` is set, it overrides the API key in the config.
- Initializes the OpenAI client and stores the model configuration.

## Methods

| Name                                | Parameters                                                                                                    | Return Type                              | Description                                                                                                    |
|------------------------------------- |--------------------------------------------------------------------------------------------------------------|------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| generate                            | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function                                | Promise<PsBaseModelReturnParameters \| undefined> | Generates a chat completion from the OpenAI model. Supports both streaming and non-streaming modes.           |
| getEstimatedNumTokensFromMessages    | messages: PsModelMessage[]                                                                                   | Promise<number>                          | Estimates the number of tokens that the given messages will consume for the current model.                     |

---

### Method Details

#### `generate`

```typescript
async generate(
  messages: PsModelMessage[],
  streaming?: boolean,
  streamingCallback?: Function
): Promise<PsBaseModelReturnParameters | undefined>
```

- **messages**: `PsModelMessage[]`  
  An array of messages (with `role` and `message` fields) to send to the model.
- **streaming**: `boolean` (optional)  
  If `true`, enables streaming responses (calls the callback with each token).
- **streamingCallback**: `Function` (optional)  
  Callback function to receive streamed tokens.

**Returns:**  
A promise that resolves to a `PsBaseModelReturnParameters` object (or `undefined` if streaming), which includes:
- `tokensIn`: Number of input tokens.
- `tokensOut`: Number of output tokens.
- `cachedInTokens`: Number of cached context tokens (if available).
- `content`: The generated content.
- `reasoningTokens`: Number of reasoning tokens (if available).
- `audioTokens`: Number of audio tokens (if available).

**Behavior:**
- Converts messages to OpenAI's expected format.
- Handles special logic for "small" models (e.g., "o1 mini") and system messages.
- Logs debug information if enabled.
- If streaming is enabled, calls the callback with each streamed token.
- If not streaming, returns the full response and token usage details.

#### `getEstimatedNumTokensFromMessages`

```typescript
async getEstimatedNumTokensFromMessages(
  messages: PsModelMessage[]
): Promise<number>
```

- **messages**: `PsModelMessage[]`  
  An array of messages to estimate token usage for.

**Returns:**  
A promise that resolves to the estimated number of tokens the messages will consume for the current model.

**Behavior:**
- Uses the `tiktoken` library to encode each message and sum the token counts.

---

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/aiModels/openAiChat.js';

const config = {
  apiKey: 'sk-...',
  modelName: 'gpt-4o',
  maxTokensOut: 4096,
  temperature: 0.7,
  modelType: 'textReasoning',
  modelSize: 'large'
};

const openAiChat = new OpenAiChat(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the capital of France?' }
];

// Non-streaming usage
const result = await openAiChat.generate(messages);
console.log(result?.content); // "The capital of France is Paris."

// Streaming usage
await openAiChat.generate(messages, true, (token) => {
  process.stdout.write(token);
});

// Estimate token usage
const estimatedTokens = await openAiChat.getEstimatedNumTokensFromMessages(messages);
console.log(`Estimated tokens: ${estimatedTokens}`);
```

---

**Note:**  
- The class supports both streaming and non-streaming completions.
- Handles special logic for "small" models and system messages to optimize prompt formatting.
- Uses environment variable `PS_AGENT_OPENAI_API_KEY` if present, for security and flexibility.
- Returns detailed token usage statistics for cost tracking and analysis.