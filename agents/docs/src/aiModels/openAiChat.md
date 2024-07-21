# OpenAiChat

The `OpenAiChat` class is a specialized chat model that interacts with the OpenAI API to generate responses based on provided messages. It extends the `BaseChatModel` class and provides methods for generating responses and estimating token usage.

## Properties

| Name   | Type     | Description                  |
|--------|----------|------------------------------|
| client | OpenAI   | An instance of the OpenAI client used to interact with the OpenAI API. |

## Constructor

### `constructor(config: PsOpenAiModelConfig)`

Creates an instance of the `OpenAiChat` class.

| Parameter | Type                | Description                                                                 |
|-----------|---------------------|-----------------------------------------------------------------------------|
| config    | PsOpenAiModelConfig | Configuration object containing the API key, model name, and maximum tokens. |

## Methods

### `generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function): Promise<any>`

Generates a response based on the provided messages. Supports both streaming and non-streaming modes.

| Parameter         | Type              | Description                                                                                  |
|-------------------|-------------------|----------------------------------------------------------------------------------------------|
| messages          | PsModelMessage[]  | An array of messages to be sent to the OpenAI API.                                           |
| streaming         | boolean           | (Optional) If true, enables streaming mode.                                                  |
| streamingCallback | Function          | (Optional) A callback function to handle streaming responses.                                |
| Returns           | Promise<any>      | A promise that resolves to the generated response, including token usage and content.        |

### `getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>`

Estimates the number of tokens required for the provided messages.

| Parameter | Type              | Description                                      |
|-----------|-------------------|--------------------------------------------------|
| messages  | PsModelMessage[]  | An array of messages to estimate token usage for.|
| Returns   | Promise<number>   | A promise that resolves to the estimated number of tokens. |

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/aiModels/openAiChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'gpt-4o',
  maxTokensOut: 4096,
};

const chatModel = new OpenAiChat(config);

const messages = [
  { role: 'system', message: 'You are a helpful assistant.' },
  { role: 'user', message: 'What is the weather like today?' },
];

chatModel.generate(messages).then(response => {
  console.log(response.content);
});

chatModel.getEstimatedNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Estimated token count: ${tokenCount}`);
});
```

This example demonstrates how to create an instance of the `OpenAiChat` class, generate a response, and estimate the number of tokens for a set of messages.