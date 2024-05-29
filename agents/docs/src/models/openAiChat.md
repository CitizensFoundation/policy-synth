# OpenAiChat

The `OpenAiChat` class is a specialized chat model that interacts with the OpenAI API to generate responses based on provided messages. It extends the `BaseChatModel` class.

## Properties

| Name   | Type   | Description                |
|--------|--------|----------------------------|
| client | OpenAI | The OpenAI client instance. |

## Methods

| Name                      | Parameters                                                                 | Return Type | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor               | config: PSOpenAiModelConfig                                                | void        | Initializes the `OpenAiChat` instance with the provided configuration.      |
| generate                  | messages: PsModelChatItem[], streaming?: boolean, streamingCallback?: Function | Promise<any> | Generates a response based on the provided messages. Supports streaming.    |
| getNumTokensFromMessages  | messages: PsModelChatItem[]                                                | Promise<number> | Calculates the number of tokens in the provided messages.                   |

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/models/openAiChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'gpt-4o',
  maxTokensOut: 4096
};

const chatModel = new OpenAiChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' }
];

chatModel.generate(messages).then(response => {
  console.log(response);
});

chatModel.getNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Total tokens: ${tokenCount}`);
});
```