# PolicySynthSimpleAgentBase

A base class for simple PolicySynth agents that interact with large language models (LLMs) and manage agent memory, tokenization, and cost tracking. This class extends `PolicySynthAgentBase` and provides utility methods for token counting, LLM calls with retry logic, memory management, and cost calculation.

## Properties

| Name                | Type                                 | Description                                                                                 |
|---------------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| memory              | PsSimpleAgentMemoryData \| undefined | The agent's memory object, used to track stages, costs, and other stateful information.      |
| timeStart           | number                               | Timestamp (ms) when the agent instance was created.                                         |
| rateLimits          | PsModelRateLimitTracking             | Tracks rate limits for different AI models.                                                 |
| models              | Map<PsAiModelType, BaseChatModel>    | Map of AI model types to their respective chat model instances.                             |
| tokenizer           | tiktoken.Tiktoken \| null            | Tokenizer instance for counting tokens (initialized per model).                             |
| needsAiModel        | boolean                              | Indicates if the agent requires an AI model (default: true).                                |
| maxModelTokensOut   | number                               | Maximum number of output tokens for the model (default: 4096).                              |
| modelTemperature    | number                               | Temperature setting for the model (default: 0.7).                                           |

## Methods

| Name                      | Parameters                                                                                                                                         | Return Type         | Description                                                                                                   |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------|
| constructor               | memory?: PsSimpleAgentMemoryData \| undefined                                                                                                      | PolicySynthSimpleAgentBase | Initializes the agent, sets up memory, tokenizer, and models if needed.                                       |
| initializeTokenizer       | none                                                                                                                                               | void                | Initializes the tokenizer for the current model.                                                              |
| getTokenizer              | none                                                                                                                                               | tiktoken.Tiktoken   | Returns the tokenizer instance, initializing it if necessary.                                                 |
| getNumTokensFromMessages  | messages: PsModelMessage[]                                                                                                                         | number              | Counts the number of tokens in a list of model messages.                                                      |
| getNumTokensFromText      | text: string                                                                                                                                       | number              | Counts the number of tokens in a text string.                                                                 |
| getApproximateTokenCount  | text: string                                                                                                                                       | number              | Approximates token count based on text length (fallback if tokenizer fails).                                  |
| initializeModels          | none                                                                                                                                               | void                | Initializes the AI model(s) based on environment variables.                                                   |
| callLLM                   | stage: string, messages: PsModelMessage[], parseJson?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function                           | Promise<any>        | Calls the LLM with retry logic, parses JSON if requested, updates memory and costs.                           |
| updateMemoryStages        | stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel                                                                           | void                | Updates the memory object with token usage and cost for a given stage.                                        |
| redisKey                  | none                                                                                                                                               | string              | Returns the Redis key for storing the agent's memory.                                                         |
| saveMemory                | none                                                                                                                                               | Promise<void>       | Saves the current memory state to Redis.                                                                      |
| fullLLMCostsForMemory     | none                                                                                                                                               | number              | Returns the total LLM cost accumulated in memory.                                                            |

## Example

```typescript
import { PolicySynthSimpleAgentBase } from '@policysynth/agents/base/simpleAgent.js';

// Example: Creating a simple agent and calling the LLM
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
  const response = await agent.callLLM("initial", messages, true);
  console.log("LLM Response:", response);
  console.log("Total LLM Cost:", agent.fullLLMCostsForMemory);
})();
```

---

**Note:**  
- This class expects certain environment variables to be set for model configuration (e.g., `AI_MODEL_API_KEY`, `AI_MODEL_NAME`, `AI_MODEL_PROVIDER`, etc.).
- The agent uses Redis for memory persistence.
- Token counting uses the `tiktoken` library and falls back to an approximate method if needed.
- The `callLLM` method includes retry logic and cost tracking for robust LLM interaction.