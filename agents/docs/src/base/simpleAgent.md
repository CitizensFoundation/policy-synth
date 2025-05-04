# PolicySynthSimpleAgentBase

A base class for simple PolicySynth agents that interact with Large Language Models (LLMs) and manage agent memory, tokenization, and cost tracking. This class extends `PolicySynthAgentBase` and provides utility methods for token counting, model initialization, LLM calls with retry logic, and memory persistence using Redis.

## Properties

| Name                | Type                                 | Description                                                                                 |
|---------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| memory              | PsSimpleAgentMemoryData \| undefined | The agent's working memory, including stage tracking and cost information.                  |
| timeStart           | number                               | Timestamp (ms) when the agent instance was created.                                         |
| rateLimits          | PsModelRateLimitTracking             | Tracks rate limits for different models.                                                    |
| models              | Map<PsAiModelType, BaseChatModel>    | Map of AI model types to their instantiated chat model objects.                             |
| tokenizer           | tiktoken.Tiktoken \| null            | Tokenizer instance for counting tokens (lazy-initialized).                                  |
| needsAiModel        | boolean                              | Indicates if the agent requires an AI model (default: true).                                |
| maxModelTokensOut   | number                               | Maximum number of output tokens for the model (default: 4096).                              |
| modelTemperature    | number                               | Temperature setting for the model (default: 0.7).                                           |

## Methods

| Name                    | Parameters                                                                                                                                         | Return Type                | Description                                                                                                    |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------|
| constructor             | memory?: PsSimpleAgentMemoryData \| undefined                                                                                                      | PolicySynthSimpleAgentBase | Initializes the agent, memory, tokenizer, and models if needed.                                                |
| private initializeTokenizer | —                                                                                                                                            | void                       | Initializes the tokenizer for the configured model.                                                            |
| private getTokenizer    | —                                                                                                                                                | tiktoken.Tiktoken          | Returns the tokenizer, initializing it if necessary.                                                           |
| protected getNumTokensFromMessages | messages: PsModelMessage[]                                                                                                            | number                     | Counts the number of tokens in a list of model messages.                                                       |
| protected getNumTokensFromText     | text: string                                                                                                                         | number                     | Counts the number of tokens in a text string.                                                                  |
| private getApproximateTokenCount   | text: string                                                                                                                         | number                     | Approximates token count if tokenizer fails (based on text length).                                            |
| initializeModels         | —                                                                                                                                                | void                       | Instantiates the appropriate chat model(s) based on environment variables.                                     |
| callLLM                 | stage: string, messages: PsModelMessage[], parseJson?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function                          | Promise<any>               | Calls the LLM with retry logic, parses JSON if requested, updates memory and cost tracking.                    |
| updateMemoryStages       | stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel                                                                         | void                       | Updates memory with token usage and cost for a given stage.                                                    |
| redisKey                | —                                                                                                                                                | string                     | Returns the Redis key for storing this agent's memory.                                                         |
| saveMemory              | —                                                                                                                                                | Promise<void>              | Persists the agent's memory to Redis.                                                                         |
| fullLLMCostsForMemory   | —                                                                                                                                                | number                     | Returns the total LLM cost accumulated in memory.                                                             |

## Example

```typescript
import { PolicySynthSimpleAgentBase } from '@policysynth/agents/base/simpleAgent.js';

// Example: Creating a simple agent with memory and calling the LLM
const memory = {
  groupId: 123,
  stages: {},
  totalCost: 0,
} as PsSimpleAgentMemoryData;

const agent = new PolicySynthSimpleAgentBase(memory);

const messages = [
  { role: "user", message: "What is the capital of France?" }
];

(async () => {
  const response = await agent.callLLM("initial", messages, false);
  console.log("LLM Response:", response);

  // Save memory to Redis
  await agent.saveMemory();

  // Get total cost so far
  console.log("Total LLM cost:", agent.fullLLMCostsForMemory);
})();
```

---

**Note:**  
- This class expects certain environment variables to be set for model configuration (e.g., `AI_MODEL_API_KEY`, `AI_MODEL_NAME`, `AI_MODEL_PROVIDER`, etc.).
- The agent uses Redis for memory persistence and `tiktoken` for token counting.
- The `callLLM` method includes retry logic and cost tracking for robust LLM interaction.
- Extend this class to implement custom agent logic, leveraging the provided memory and LLM utilities.