# GoogleGeminiChat

The `GoogleGeminiChat` class is a specialized chat model that extends the `BaseChatModel`. It utilizes the Google Generative AI to generate responses based on a series of messages. This class is designed to handle both streaming and non-streaming chat interactions.

## Properties

| Name   | Type              | Description                          |
|--------|-------------------|--------------------------------------|
| client | GoogleGenerativeAI | An instance of the Google Generative AI client. |
| model  | GenerativeModel   | The generative model used for chat interactions. |

## Constructor

### GoogleGeminiChat(config: PsAiModelConfig)

Creates an instance of the `GoogleGeminiChat` class.

- **Parameters:**
  - `config`: `PsAiModelConfig` - Configuration object for the AI model, including API key, model name, and maximum tokens.

## Methods

### generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void)

Generates a response based on the provided messages. Supports both streaming and non-streaming modes.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to process.
  - `streaming`: `boolean` (optional) - If true, enables streaming mode.
  - `streamingCallback`: `(chunk: string) => void` (optional) - Callback function for handling streamed chunks.

- **Returns:** 
  - An object containing `tokensIn`, `tokensOut`, and `content`.

### getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number>

Estimates the number of tokens required for the provided messages using the library's built-in token counting feature.

- **Parameters:**
  - `messages`: `PsModelMessage[]` - An array of messages to estimate token count for.

- **Returns:** 
  - A promise that resolves to the estimated number of tokens.

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
  { role: 'system', message: 'This is a system message.' },
  { role: 'user', message: 'Hello, how are you?' },
];

chatModel.generate(messages, true, (chunk) => {
  console.log('Received chunk:', chunk);
}).then(response => {
  console.log('Final response:', response.content);
});
```

This example demonstrates how to create an instance of `GoogleGeminiChat`, send a series of messages, and handle the response in streaming mode.