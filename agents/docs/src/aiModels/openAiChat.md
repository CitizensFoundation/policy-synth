# OpenAiChat

The `OpenAiChat` class is a specialized chat model that extends the `BaseChatModel` class. It is designed to interact with the OpenAI API to generate chat completions based on provided messages. This class handles both streaming and non-streaming responses from the OpenAI API.

## Properties

| Name         | Type                | Description                                      |
|--------------|---------------------|--------------------------------------------------|
| client       | OpenAI              | An instance of the OpenAI client for API calls.  |
| modelConfig  | PsOpenAiModelConfig | Configuration settings for the OpenAI model.     |

## Constructor

### OpenAiChat(config: PsOpenAiModelConfig)

Creates an instance of the `OpenAiChat` class.

- **Parameters:**
  - `config`: `PsOpenAiModelConfig` - Configuration object for the OpenAI model, including API key, model name, max tokens, and temperature.

## Methods

| Name                                    | Parameters                                                                 | Return Type | Description                                                                 |
|-----------------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| `generate`                              | `messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function` | `Promise<any>` | Generates chat completions using the OpenAI API, with optional streaming.   |
| `getEstimatedNumTokensFromMessages`     | `messages: PsModelMessage[]`                                               | `Promise<number>` | Estimates the number of tokens in the provided messages.                    |

### generate

Generates chat completions using the OpenAI API. Supports both streaming and non-streaming responses.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to be sent to the OpenAI API.
  - `streaming`: `boolean` (optional) - If true, enables streaming of responses.
  - `streamingCallback`: `Function` (optional) - Callback function to handle streaming data.

- **Returns:** `Promise<any>` - A promise that resolves with the generated content and token usage details.

### getEstimatedNumTokensFromMessages

Estimates the number of tokens in the provided messages using the Tiktoken model.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to estimate token count.

- **Returns:** `Promise<number>` - A promise that resolves with the estimated number of tokens.

## Example

```typescript
import { OpenAiChat } from '@policysynth/agents/aiModels/openAiChat.js';

const config = {
  apiKey: 'your-api-key',
  modelName: 'gpt-4o',
  maxTokensOut: 4096,
  temperature: 0.7,
};

const openAiChat = new OpenAiChat(config);

const messages = [
  { role: 'user', message: 'Hello, how are you?' },
  { role: 'assistant', message: 'I am fine, thank you!' },
];

openAiChat.generate(messages).then(response => {
  console.log(response.content);
});
```

This example demonstrates how to create an instance of the `OpenAiChat` class and use it to generate chat completions from a series of messages.