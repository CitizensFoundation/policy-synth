# OpenAiChat

The `OpenAiChat` class is an extension of the `BaseChatModel` class, designed to interact with OpenAI's chat models. It provides functionality to generate responses from OpenAI's models, either in a streaming or non-streaming manner, and to estimate the number of tokens in a given set of messages.

## Properties

| Name         | Type                | Description                                      |
|--------------|---------------------|--------------------------------------------------|
| client       | OpenAI              | An instance of the OpenAI client for API calls.  |
| modelConfig  | PsOpenAiModelConfig | Configuration settings for the OpenAI model.     |

## Constructor

### OpenAiChat(config: PsOpenAiModelConfig)

Creates an instance of the `OpenAiChat` class.

- **Parameters:**
  - `config`: `PsOpenAiModelConfig` - Configuration settings for the OpenAI model, including API key, model name, maximum tokens, and temperature.

## Methods

| Name                                    | Parameters                                                                 | Return Type | Description                                                                 |
|-----------------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| `generate`                              | `messages: PsModelMessage[]`, `streaming?: boolean`, `streamingCallback?: Function` | `Promise<any>` | Generates a response from the OpenAI model based on the provided messages. |
| `getEstimatedNumTokensFromMessages`     | `messages: PsModelMessage[]`                                               | `Promise<number>` | Estimates the number of tokens in the provided messages.                    |

### generate

Generates a response from the OpenAI model based on the provided messages. Supports both streaming and non-streaming modes.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to be sent to the OpenAI model.
  - `streaming`: `boolean` (optional) - If true, enables streaming mode.
  - `streamingCallback`: `Function` (optional) - A callback function to handle streaming tokens.

- **Returns:** `Promise<any>` - A promise that resolves with the response from the OpenAI model.

### getEstimatedNumTokensFromMessages

Estimates the number of tokens in the provided messages using the Tiktoken encoding.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages for which to estimate the token count.

- **Returns:** `Promise<number>` - A promise that resolves with the estimated number of tokens.

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/aiModels/openAiChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'gpt-4o',
  maxTokensOut: 16384,
  temperature: 0.7,
};

const openAiChat = new OpenAiChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' },
];

openAiChat.generate(messages).then(response => {
  console.log(response);
});
```

This example demonstrates how to create an instance of the `OpenAiChat` class and use it to generate a response from the OpenAI model.