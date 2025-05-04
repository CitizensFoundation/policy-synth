# ClaudeChat

A chat model wrapper for Anthropic's Claude models, extending `BaseChatModel`. This class provides an interface to interact with Claude via the Anthropic SDK, supporting both standard and streaming message generation, token usage tracking, and prompt formatting.

## Properties

| Name               | Type              | Description                                                                                 |
|--------------------|-------------------|---------------------------------------------------------------------------------------------|
| client             | Anthropic         | Anthropic SDK client instance used to communicate with Claude models.                       |
| maxThinkingTokens  | number \| undefined | Optional maximum number of "thinking" tokens for Claude's internal reasoning.               |
| config             | PsAiModelConfig   | Configuration object for the Claude model, including API key, model name, and other options.|

## Constructor

```typescript
constructor(config: PsAiModelConfig)
```
- **config**: `PsAiModelConfig`  
  The configuration for the Claude model, including API key, model name, max tokens, temperature, etc.

## Methods

| Name                              | Parameters                                                                                                 | Return Type                | Description                                                                                                   |
|------------------------------------|------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| generate                          | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function                              | Promise\<object \| void\>  | Generates a response from Claude. Supports both streaming and non-streaming modes.                            |
| getTextTypeFromContent             | content: ContentBlock[]                                                                                    | string                     | Extracts the text content from Claude's response content blocks.                                               |
| getEstimatedNumTokensFromMessages  | messages: PsModelMessage[]                                                                                 | Promise\<number\>          | Estimates the number of tokens in the provided messages using the Tiktoken encoder.                            |

---

### generate

```typescript
async generate(
  messages: PsModelMessage[],
  streaming?: boolean,
  streamingCallback?: Function
): Promise<{ tokensIn: number, tokensOut: number, content: string } | void>
```

- **messages**: `PsModelMessage[]`  
  Array of messages to send to the Claude model. Each message has a `role` and `message` string.
- **streaming**: `boolean` (optional)  
  If true, enables streaming responses from Claude.
- **streamingCallback**: `Function` (optional)  
  Callback function to handle streaming events.

**Returns**:  
- If streaming: `void` (calls the callback for each streamed event)
- If not streaming: An object with `tokensIn`, `tokensOut`, and `content` (the generated text).

**Description**:  
Sends the provided messages to the Claude model and returns the generated response. Handles system messages, formats the prompt, and tracks token usage. In streaming mode, calls the callback for each event.

---

### getTextTypeFromContent

```typescript
getTextTypeFromContent(content: ContentBlock[]): string
```

- **content**: `ContentBlock[]`  
  Array of content blocks returned by Claude.

**Returns**:  
- The first text block's content as a string, or `"unknown"` if not found.

**Description**:  
Extracts and returns the text from the first content block of type `"text"`. Logs a warning if no text block is found.

---

### getEstimatedNumTokensFromMessages

```typescript
async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>
```

- **messages**: `PsModelMessage[]`  
  Array of messages to estimate token count for.

**Returns**:  
- Estimated number of tokens as a `Promise<number>`.

**Description**:  
Estimates the number of tokens in the provided messages using the Tiktoken encoder (currently hardcoded to use `"gpt-4o"` encoding).

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
};

const claude = new ClaudeChat(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the capital of France?' }
];

(async () => {
  const result = await claude.generate(messages);
  console.log(result.content); // "The capital of France is Paris."
})();
```

---

**Note:**  
- This class is designed for use within the PolicySynth agent framework and expects `PsModelMessage` and `PsAiModelConfig` types as defined in the project.
- Streaming mode is supported via the `streaming` and `streamingCallback` parameters.
- Token usage is tracked and returned for non-streaming calls.