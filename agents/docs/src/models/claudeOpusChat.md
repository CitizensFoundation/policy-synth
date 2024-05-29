# ClaudeOpusChat

The `ClaudeOpusChat` class is a chat model that interacts with the Anthropic API to generate responses based on input messages. It extends the `BaseChatModel` class.

## Properties

| Name   | Type      | Description                |
|--------|-----------|----------------------------|
| client | Anthropic | Instance of the Anthropic client used to interact with the API. |

## Methods

| Name                    | Parameters                                                                 | Return Type  | Description                                                                 |
|-------------------------|----------------------------------------------------------------------------|--------------|-----------------------------------------------------------------------------|
| constructor             | config: PSModelConfig                                                      | void         | Initializes the `ClaudeOpusChat` instance with the provided configuration.  |
| generate                | messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function | Promise<any> | Generates a response based on the input messages. Supports streaming.       |
| getNumTokensFromMessages| messages: PsModelChatItem[]                                                | Promise<number> | Calculates the number of tokens in the input messages.                      |

## Example

```typescript
import { ClaudeOpusChat } from '@policysynth/agents/models/claudeOpusChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'claude-3-opus-20240229',
  maxTokensOut: 4096
};

const chatModel = new ClaudeOpusChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' }
];

chatModel.generate(messages).then(response => {
  console.log(response);
});

chatModel.getNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Token count: ${tokenCount}`);
});
```