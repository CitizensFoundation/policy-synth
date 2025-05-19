# PolicySynthSimpleAgentBase

A base class for simple PolicySynth agents that require integration with Large Language Models (LLMs) such as OpenAI, Anthropic, Google Gemini, or Azure OpenAI. This class provides memory management, token counting, model initialization, LLM call handling with retries, and cost tracking. It is designed to be extended for building custom AI agents that interact with LLMs and maintain state in Redis.

## Properties

| Name                | Type                                 | Description                                                                                  |
|---------------------|--------------------------------------|----------------------------------------------------------------------------------------------|
| memory              | PsSimpleAgentMemoryData \| undefined | The agent's memory object, used for tracking stages, costs, and state.                       |
| timeStart           | number                               | Timestamp (ms) when the agent instance was created.                                          |
| rateLimits          | PsModelRateLimitTracking             | Tracks rate limits for different models.                                                     |
| models              | Map<PsAiModelType, BaseChatModel>    | Map of AI model types to their instantiated chat model objects.                              |
| tokenizer           | tiktoken.Tiktoken \| null            | Tokenizer instance for counting tokens (initialized per model).                              |
| needsAiModel        | boolean                              | Indicates if the agent requires an AI model (default: true).                                |
| maxModelTokensOut   | number                               | Maximum number of output tokens for the model (default: 4096).                               |
| modelTemperature    | number                               | Temperature setting for the model (default: 0.7).                                            |

## Methods

| Name                        | Parameters                                                                                                                                         | Return Type         | Description                                                                                                   |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                 | memory?: PsSimpleAgentMemoryData \| undefined                                                                                                      | PolicySynthSimpleAgentBase | Initializes the agent, memory, tokenizer, and models if needed.                                                |
| private initializeTokenizer | —                                                                                                                                                  | void                | Initializes the tokenizer for the current model.                                                              |
| private getTokenizer        | —                                                                                                                                                  | tiktoken.Tiktoken   | Returns the tokenizer, initializing it if necessary.                                                          |
| protected getNumTokensFromMessages | messages: PsModelMessage[]                                                                                                                  | number              | Counts the number of tokens in a list of model messages.                                                      |
| protected getNumTokensFromText     | text: string                                                                                                                               | number              | Counts the number of tokens in a text string.                                                                 |
| private getApproximateTokenCount   | text: string                                                                                                                               | number              | Approximates token count based on text length (fallback if tokenizer fails).                                  |
| initializeModels            | —                                                                                                                                                  | void                | Initializes the AI model(s) based on environment variables.                                                    |
| callLLM                     | stage: string, messages: PsModelMessage[], parseJson?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function                           | Promise<any>        | Calls the LLM with retry logic, handles streaming, parses JSON if requested, and updates memory/costs.         |
| updateMemoryStages          | stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel                                                                           | void                | Updates the memory object with token usage and cost for a given stage.                                         |
| redisKey                    | —                                                                                                                                                  | string              | Returns the Redis key for storing the agent's memory.                                                          |
| saveMemory                  | —                                                                                                                                                  | Promise<void>       | Saves the current memory state to Redis.                                                                       |
| fullLLMCostsForMemory       | —                                                                                                                                                  | number              | Returns the total LLM cost accumulated in memory.                                                             |

## Example

```typescript
import { PolicySynthSimpleAgentBase } from '@policysynth/agents/base/simpleAgent.js';

// Example: Extending the base class for a custom agent
class MyCustomAgent extends PolicySynthSimpleAgentBase {
  async run() {
    const messages = [
      { role: "system", message: "You are a helpful assistant." },
      { role: "user", message: "What is the capital of France?" }
    ];
    const response = await this.callLLM("capital_query", messages, false);
    console.log("LLM Response:", response);
  }
}

// Usage
const agentMemory = {
  groupId: 123,
  stages: {},
  totalCost: 0
};
const agent = new MyCustomAgent(agentMemory);
agent.run();
```

---

**Note:**  
- This class expects environment variables for model configuration: `AI_MODEL_API_KEY`, `AI_MODEL_NAME`, `AI_MODEL_PROVIDER`, etc.
- Memory is persisted in Redis using a key based on the group ID.
- Token and cost tracking is handled per stage and overall.
- Supports retry logic and error handling for LLM calls.
- Designed for extension—implement your own agent logic by subclassing and using the provided LLM and memory utilities.