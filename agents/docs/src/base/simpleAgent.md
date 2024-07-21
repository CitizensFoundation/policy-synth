# PolicySynthSimpleAgentBase

The `PolicySynthSimpleAgentBase` class extends the `PolicySynthAgentBase` class and provides functionalities for managing AI models, tokenization, and memory for a simple agent. This class is designed to handle interactions with various AI models, manage rate limits, and maintain memory states using Redis.

## Properties

| Name                | Type                          | Description                                                                 |
|---------------------|-------------------------------|-----------------------------------------------------------------------------|
| memory              | PsSimpleAgentMemoryData       | Optional memory data for the agent.                                         |
| timeStart           | number                        | Timestamp when the agent was initialized.                                   |
| rateLimits          | PsModelRateLimitTracking      | Object to track rate limits for different models.                           |
| models              | Map<PsAiModelType, BaseChatModel> | Map to store initialized AI models.                                         |
| tokenizer           | tiktoken.Tiktoken \| null     | Tokenizer instance for encoding messages.                                   |
| needsAiModel        | boolean                       | Flag indicating if the agent needs an AI model.                             |
| maxModelTokensOut   | number                        | Maximum number of tokens for model output.                                  |
| modelTemperature    | number                        | Temperature setting for the AI model.                                       |

## Methods

| Name                       | Parameters                                                                 | Return Type | Description                                                                 |
|----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor                | memory: PsSimpleAgentMemoryData \| undefined = undefined                    | void        | Initializes the agent with optional memory data.                            |
| initializeTokenizer        | -                                                                          | void        | Initializes the tokenizer based on the model name.                          |
| getTokenizer               | -                                                                          | tiktoken.Tiktoken | Retrieves the tokenizer instance, initializing it if necessary.             |
| getNumTokensFromMessages   | messages: PsModelMessage[]                                                 | number      | Calculates the number of tokens in a list of messages.                      |
| getNumTokensFromText       | text: string                                                               | number      | Calculates the number of tokens in a text string.                           |
| getApproximateTokenCount   | text: string                                                               | number      | Approximates the token count based on text length.                          |
| initializeModels           | -                                                                          | void        | Initializes AI models based on environment variables.                       |
| callLLM                    | stage: string, messages: PsModelMessage[], parseJson = true, tokenOutEstimate = 120, streamingCallbacks?: Function | Promise<any> | Calls the language model and handles retries and rate limits.               |
| updateMemoryStages         | stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel   | void        | Updates memory stages with token usage and costs.                           |
| saveMemory                 | -                                                                          | Promise<void> | Saves the memory state to Redis.                                            |
| redisKey                   | -                                                                          | string      | Retrieves the Redis key for storing memory.                                 |
| fullLLMCostsForMemory      | -                                                                          | number      | Retrieves the total cost of LLM usage from memory.                          |

## Example

```typescript
import { PolicySynthSimpleAgentBase } from '@policysynth/agents/base/simpleAgent.js';

const agentMemory: PsSimpleAgentMemoryData = {
  groupId: 1,
  stages: {},
  totalCost: 0,
};

const agent = new PolicySynthSimpleAgentBase(agentMemory);

const messages: PsModelMessage[] = [
  { role: "user", message: "Hello, how are you?" },
  { role: "assistant", message: "I'm good, thank you!" }
];

(async () => {
  const response = await agent.callLLM("greeting", messages);
  console.log(response);
})();
```

This example demonstrates how to initialize the `PolicySynthSimpleAgentBase` with memory data, prepare a list of messages, and call the language model to get a response.