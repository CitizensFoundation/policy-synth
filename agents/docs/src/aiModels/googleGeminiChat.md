# GoogleGeminiChat

The `GoogleGeminiChat` class is a specialized chat model that extends the `BaseChatModel`. It utilizes the Google Generative AI to facilitate chat interactions, supporting both standard and streaming message generation.

## Properties

| Name   | Type              | Description                          |
|--------|-------------------|--------------------------------------|
| client | GoogleGenerativeAI | An instance of the Google Generative AI client. |
| model  | GenerativeModel   | The generative model used for chat interactions. |

## Constructor

### GoogleGeminiChat(config: PsAiModelConfig)

Creates an instance of `GoogleGeminiChat`.

- **Parameters:**
  - `config`: `PsAiModelConfig` - Configuration object for the AI model, including API key and model settings.

## Methods

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function)

Generates a response based on the provided messages.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to be processed by the chat model.
  - `streaming`: `boolean` (optional) - Indicates if the response should be streamed.
  - `streamingCallback`: `Function` (optional) - Callback function to handle streaming chunks.

- **Returns:** `Promise<object>` - An object containing token usage and generated content.

### getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>

Estimates the number of tokens required for the provided messages.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages for which to estimate token usage.

- **Returns:** `Promise<number>` - The estimated number of tokens.

## Example

```typescript
import { GoogleGeminiChat } from '@policysynth/agents/aiModels/googleGeminiChat.js';

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
  console.log(response.content);
});
```

This class provides a structured way to interact with Google's generative AI, allowing for both synchronous and asynchronous message handling.