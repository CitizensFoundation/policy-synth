# GoogleGeminiChat

The `GoogleGeminiChat` class is a chat model that integrates with Google's Generative AI to generate responses based on input messages. It extends the `BaseChatModel` class.

## Properties

| Name   | Type               | Description                        |
|--------|--------------------|------------------------------------|
| client | GoogleGenerativeAI | Instance of the GoogleGenerativeAI client. |
| model  | any                | The generative model instance.     |

## Methods

| Name                     | Parameters                                                                 | Return Type | Description                                                                 |
|--------------------------|---------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor              | config: PSModelConfig                                                     | void        | Initializes the `GoogleGeminiChat` instance with the provided configuration. |
| generate                 | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function | Promise<any> | Generates a response based on the input messages. Supports streaming.       |
| getNumTokensFromMessages | messages: PsModelMessage[]                                               | Promise<number> | Calculates the number of tokens in the input messages.                      |

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/models/googleGeminiChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'gemini-pro',
  maxTokensOut: 4096,
};

const chatModel = new GoogleGeminiChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' },
];

chatModel.generate(messages).then(response => {
  console.log(response);
});

chatModel.getNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Total tokens: ${tokenCount}`);
});
```