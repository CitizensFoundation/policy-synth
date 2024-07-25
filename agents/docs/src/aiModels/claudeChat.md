# ClaudeChat

The `ClaudeChat` class is a specialized chat model that extends the `BaseChatModel` class. It utilizes the Anthropic API to generate responses based on provided messages. This class supports both synchronous and streaming message generation.

## Properties

| Name    | Type     | Description                  |
|---------|----------|------------------------------|
| client  | Anthropic | An instance of the Anthropic client used to interact with the Anthropic API. |

## Constructor

### `constructor(config: PsAiModelConfig)`

Creates an instance of the `ClaudeChat` class.

| Parameter | Type           | Description                                                                 |
|-----------|----------------|-----------------------------------------------------------------------------|
| config    | PsAiModelConfig | Configuration object containing API key, model name, and maximum tokens out. |

## Methods

### `generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>`

Generates a response based on the provided messages. Supports both synchronous and streaming responses.

| Parameter         | Type                | Description                                                                                     |
|-------------------|---------------------|-------------------------------------------------------------------------------------------------|
| messages          | PsModelMessage[]    | An array of messages to be processed by the model.                                              |
| streaming         | boolean (optional)  | A flag indicating whether to use streaming for the response.                                     |
| streamingCallback | Function (optional) | A callback function to handle streaming events.                                                  |

**Returns:** `Promise<any>` - A promise that resolves to the generated response or undefined if streaming is used.

### `getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>`

Estimates the number of tokens in the provided messages.

| Parameter | Type             | Description                              |
|-----------|------------------|------------------------------------------|
| messages  | PsModelMessage[] | An array of messages to estimate tokens. |

**Returns:** `Promise<number>` - A promise that resolves to the estimated number of tokens.

## Example

```typescript
import { ClaudeChat } from '@policysynth/agents/aiModels/claudeChat.js';

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

claudeChat.getEstimatedNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Estimated token count: ${tokenCount}`);
});
```

This example demonstrates how to create an instance of the `ClaudeChat` class, generate a response, and estimate the number of tokens in a set of messages.