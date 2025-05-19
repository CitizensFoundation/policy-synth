# ClaudeChat

The `ClaudeChat` class provides an interface for interacting with Anthropic's Claude chat models, supporting both standard and streaming message generation. It extends the `BaseChatModel` and is designed to be used as a backend for AI chat agents, handling prompt formatting, system messages, token accounting, and streaming callbacks.

## Properties

| Name               | Type                | Description                                                                                 |
|--------------------|---------------------|---------------------------------------------------------------------------------------------|
| client             | Anthropic           | The Anthropic SDK client instance used to communicate with the Claude API.                  |
| maxThinkingTokens  | number \| undefined | Optional maximum number of "thinking" tokens for Claude's internal reasoning.               |
| config             | PsAiModelConfig     | The configuration object for the Claude model, including API key, model name, and settings. |

## Constructor

### `constructor(config: PsAiModelConfig)`

Creates a new instance of `ClaudeChat`.

- **Parameters:**
  - `config` (`PsAiModelConfig`): Configuration for the Claude model, including API key, model name, max tokens, etc.

## Methods

| Name                                | Parameters                                                                                                                                         | Return Type                          | Description                                                                                                   |
|------------------------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|---------------------------------------------------------------------------------------------------------------|
| generate                            | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function                                                                      | Promise<PsBaseModelReturnParameters \| undefined> | Generates a response from Claude based on the provided messages. Supports streaming and non-streaming modes.  |
| getTextTypeFromContent              | content: ContentBlock[]                                                                                                                            | string                               | Extracts and returns the text content from Claude's response content blocks.                                  |
| getEstimatedNumTokensFromMessages    | messages: PsModelMessage[]                                                                                                                         | Promise<number>                      | Estimates the number of tokens in the provided messages using the Tiktoken encoder.                           |

---

### `async generate(messages, streaming?, streamingCallback?)`

Generates a response from the Claude model.

- **Parameters:**
  - `messages` (`PsModelMessage[]`): Array of message objects with `role` and `message` fields.
  - `streaming` (`boolean`, optional): If true, enables streaming responses.
  - `streamingCallback` (`Function`, optional): Callback function to handle streaming events.

- **Returns:**  
  - `Promise<PsBaseModelReturnParameters | undefined>`: Returns the model's output, including token usage and content, or `undefined` if streaming.

- **Behavior:**
  - Filters out system messages and formats the rest for the Claude API.
  - Handles system messages with cache control if present.
  - If streaming is enabled, yields events to the callback.
  - If not streaming, returns the response content and token usage.

---

### `getTextTypeFromContent(content)`

Extracts the first text block from Claude's response content.

- **Parameters:**
  - `content` (`ContentBlock[]`): Array of content blocks from Claude's response.

- **Returns:**  
  - `string`: The text content if found, otherwise `"unknown"`.

---

### `async getEstimatedNumTokensFromMessages(messages)`

Estimates the number of tokens in the provided messages.

- **Parameters:**
  - `messages` (`PsModelMessage[]`): Array of message objects.

- **Returns:**  
  - `Promise<number>`: The estimated token count.

- **Behavior:**
  - Uses the `tiktoken` encoder (with a default model) to estimate the token count for the concatenated messages.

---

## Example

```typescript
import { ClaudeChat } from '@policysynth/agents/aiModels/claudeChat.js';

const config = {
  apiKey: 'sk-...',
  modelName: 'claude-3-opus-20240229',
  maxTokensOut: 4096,
  modelType: 'anthropic',
  modelSize: 'large',
  temperature: 0.7,
  reasoningEffort: 'medium',
  prices: {
    costInTokensPerMillion: 10,
    costOutTokensPerMillion: 10,
    costInCachedContextTokensPerMillion: 2,
    currency: 'USD'
  }
};

const claude = new ClaudeChat(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the capital of France?' }
];

const response = await claude.generate(messages);
console.log(response?.content); // "The capital of France is Paris."
```

---

**File:** `@policysynth/agents/aiModels/claudeChat.js`