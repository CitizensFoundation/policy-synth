# ClaudeChat

The `ClaudeChat` class is a specialized chat model that extends the `BaseChatModel`. It is designed to interact with the Anthropic API to generate chat responses using the Claude model.

## Properties

| Name   | Type      | Description                  |
|--------|-----------|------------------------------|
| client | Anthropic | An instance of the Anthropic client used to interact with the API. |

## Constructor

### ClaudeChat(config: PsAiModelConfig)

Creates an instance of the `ClaudeChat` class.

- **Parameters:**
  - `config`: `PsAiModelConfig` - Configuration object for the AI model, including API key, model name, and maximum tokens.

## Methods

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function)

Generates a response based on the provided messages.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to be processed by the model.
  - `streaming`: `boolean` (optional) - Indicates if the response should be streamed.
  - `streamingCallback`: `Function` (optional) - Callback function to handle streaming events.

- **Returns:** 
  - `Promise<{ tokensIn: number, tokensOut: number, content: string } | undefined>` - Returns an object containing token usage and generated content, or `undefined` if streaming.

### getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>

Estimates the number of tokens in the provided messages.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to estimate token count.

- **Returns:** 
  - `Promise<number>` - The estimated number of tokens.

## Example

```typescript
import ClaudeChat from '@policysynth/agents/aiModels/claudeChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'claude-3-opus-20240229',
  maxTokensOut: 4096,
};

const claudeChat = new ClaudeChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' },
];

claudeChat.generate(messages).then(response => {
  console.log(response);
});
```

This class provides a structured way to interact with the Claude model from Anthropic, allowing for both synchronous and streaming message generation.