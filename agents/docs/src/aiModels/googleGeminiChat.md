# GoogleGeminiChat

The `GoogleGeminiChat` class is a specialized chat model that integrates with Google's Generative AI services. It extends the `BaseChatModel` and provides methods to generate chat responses and estimate token usage.

## Properties

| Name    | Type               | Description                                      |
|---------|--------------------|--------------------------------------------------|
| client  | GoogleGenerativeAI | Instance of the Google Generative AI client.     |
| model   | GenerativeModel    | The generative model used for chat generation.   |

## Constructor

### `constructor(config: PsAiModelConfig)`

Initializes a new instance of the `GoogleGeminiChat` class.

| Parameter | Type           | Description                                      |
|-----------|----------------|--------------------------------------------------|
| config    | PsAiModelConfig | Configuration object for the AI model.           |

## Methods

### `generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>`

Generates chat responses based on the provided messages. Supports both streaming and non-streaming modes.

| Parameter         | Type               | Description                                                                 |
|-------------------|--------------------|-----------------------------------------------------------------------------|
| messages          | PsModelMessage[]   | Array of messages to generate responses for.                                |
| streaming         | boolean (optional) | Flag to indicate if streaming mode should be used.                          |
| streamingCallback | Function (optional)| Callback function to handle streaming chunks.                               |

### `getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>`

Estimates the number of tokens required for the provided messages.

| Parameter | Type             | Description                                      |
|-----------|------------------|--------------------------------------------------|
| messages  | PsModelMessage[] | Array of messages to estimate token usage for.    |

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/aiModels/googleGeminiChat.js';

const config = {
  apiKey: 'your-google-api-key',
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

chatModel.getEstimatedNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Estimated tokens: ${tokenCount}`);
});
```

This class provides a convenient way to interact with Google's Generative AI for chat-based applications, supporting both synchronous and asynchronous message generation.