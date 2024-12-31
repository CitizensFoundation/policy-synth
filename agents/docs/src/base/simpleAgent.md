# PolicySynthSimpleAgentBase

The `PolicySynthSimpleAgentBase` class is a specialized agent class that extends the `PolicySynthAgentBase`. It is designed to interact with AI models for natural language processing tasks, utilizing various AI model providers such as OpenAI, Anthropic, Google, and Azure. The class manages AI model initialization, tokenization, and rate limiting, and provides methods for calling language models (LLMs) and handling their responses.

## Properties

| Name                  | Type                              | Description                                                                 |
|-----------------------|-----------------------------------|-----------------------------------------------------------------------------|
| memory                | `PsSimpleAgentMemoryData`         | Optional memory data for the agent.                                         |
| timeStart             | `number`                          | Timestamp indicating when the agent was started.                            |
| rateLimits            | `PsModelRateLimitTracking`        | Tracks rate limits for AI model usage.                                      |
| models                | `Map<PsAiModelType, BaseChatModel>` | A map of AI models initialized for the agent.                               |
| tokenizer             | `tiktoken.Tiktoken \| null`       | Tokenizer instance for encoding messages.                                   |
| needsAiModel          | `boolean`                         | Indicates if the agent requires an AI model.                                |
| maxModelTokensOut     | `number`                          | Maximum number of tokens the model can output.                              |
| modelTemperature      | `number`                          | Temperature setting for the AI model, affecting randomness of outputs.      |

## Methods

| Name                        | Parameters                                                                 | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor                 | `memory?: PsSimpleAgentMemoryData`                                         | `void`      | Initializes the agent, setting up memory and models if needed.              |
| initializeTokenizer         | `void`                                                                     | `void`      | Initializes the tokenizer based on the AI model name.                       |
| getTokenizer                | `void`                                                                     | `tiktoken.Tiktoken` | Retrieves the tokenizer, initializing it if necessary.                      |
| getNumTokensFromMessages    | `messages: PsModelMessage[]`                                               | `number`    | Calculates the number of tokens in a list of messages.                      |
| getNumTokensFromText        | `text: string`                                                             | `number`    | Calculates the number of tokens in a text string.                           |
| getApproximateTokenCount    | `text: string`                                                             | `number`    | Approximates token count based on text length.                              |
| initializeModels            | `void`                                                                     | `void`      | Initializes AI models based on environment variables.                       |
| callLLM                     | `stage: string, messages: PsModelMessage[], parseJson = true, tokenOutEstimate = 120, streamingCallbacks?: Function` | `Promise<any>` | Calls the language model with specified messages and handles the response.  |
| updateMemoryStages          | `stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel` | `void`      | Updates memory stages with token usage and costs.                           |
| redisKey                    | `void`                                                                     | `string`    | Retrieves the Redis key for storing agent memory.                           |
| saveMemory                  | `void`                                                                     | `Promise<void>` | Saves the agent's memory to Redis.                                          |
| fullLLMCostsForMemory       | `void`                                                                     | `number`    | Retrieves the total cost of LLM usage from memory.                          |

## Example

```typescript
import { PolicySynthSimpleAgentBase } from '@policysynth/agents/base/simpleAgent.js';

const agentMemory: PsSimpleAgentMemoryData = {
  groupId: 123,
  stages: {},
  totalCost: 0,
};

const agent = new PolicySynthSimpleAgentBase(agentMemory);

const messages: PsModelMessage[] = [
  { role: "user", message: "Hello, how are you?" },
  { role: "assistant", message: "I'm good, thank you!" }
];

agent.callLLM("greeting", messages).then(response => {
  console.log("LLM Response:", response);
});
```

This example demonstrates how to create an instance of `PolicySynthSimpleAgentBase`, initialize it with memory, and call a language model with a series of messages. The response from the LLM is logged to the console.