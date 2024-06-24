# AzureOpenAiChat

The `AzureOpenAiChat` class is a specialized chat model that interacts with the Azure OpenAI service to generate chat completions. It extends the `BaseChatModel` class and provides methods for generating chat responses and calculating the number of tokens in messages.

## Properties

| Name           | Type          | Description                                      |
|----------------|---------------|--------------------------------------------------|
| client         | OpenAIClient  | The client used to interact with the Azure OpenAI service. |
| deploymentName | string        | The name of the deployment to use for generating chat completions. |

## Methods

| Name                    | Parameters                                                                 | Return Type  | Description                                                                 |
|-------------------------|----------------------------------------------------------------------------|--------------|-----------------------------------------------------------------------------|
| constructor             | config: PSAzureModelConfig                                                 | void         | Initializes a new instance of the `AzureOpenAiChat` class.                  |
| generate                | messages: PsModelMessage[], streaming?: boolean, streamingCallback?: Function | Promise<any> | Generates chat completions based on the provided messages.                  |
| getNumTokensFromMessages| messages: PsModelMessage[]                                                | Promise<number> | Calculates the number of tokens in the provided messages.                   |

## Example

```typescript
import { AzureOpenAiChat } from '@policysynth/agents/models/azureOpenAiChat.js';

const config = {
  endpoint: "https://your-endpoint.openai.azure.com/",
  apiKey: "your-api-key",
  deploymentName: "your-deployment-name",
  modelName: "gpt-4o",
  maxTokensOut: 4096
};

const chatModel = new AzureOpenAiChat(config);

const messages = [
  { role: "user", message: "Hello, how are you?" },
  { role: "assistant", message: "I'm good, thank you!" }
];

chatModel.generate(messages).then(response => {
  console.log(response);
});

chatModel.getNumTokensFromMessages(messages).then(tokenCount => {
  console.log(`Total tokens: ${tokenCount}`);
});
```