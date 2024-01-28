# PolicySynthAgentBase

This class serves as a base for policy synthesis agents, providing functionalities such as managing memory, logging, handling JSON blocks, calculating costs, calling language models, and interacting with Redis for memory persistence.

## Properties

| Name         | Type                        | Description                                      |
|--------------|-----------------------------|--------------------------------------------------|
| memory       | PsBaseMemoryData \| undefined | Optional memory data for the agent.              |
| logger       | winston.Logger              | Logger instance for logging purposes.            |
| timeStart    | number                      | Timestamp indicating the start time.             |
| chat         | ChatOpenAI \| undefined     | Optional ChatOpenAI instance for making calls.   |
| rateLimits   | IEngineRateLimits           | Object to track rate limits for engine calls.    |

## Methods

| Name                | Parameters                                                                                                   | Return Type            | Description                                                                                   |
|---------------------|--------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| constructor         | memory: PsBaseMemoryData \| undefined = undefined                                                            |                        | Initializes the agent with optional memory data.                                              |
| getJsonBlock        | text: string                                                                                                 | string \| undefined    | Extracts a JSON block from a given text.                                                      |
| get fullLLMCostsForMemory |                                                                                                              | number \| undefined    | Calculates the total LLM costs for the memory stages.                                         |
| getRepairedJson     | text: string                                                                                                 | any                    | Attempts to repair and parse a JSON string, extracting it from a markdown code block if necessary. |
| callLLM             | stage: PsMemoryStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean = true, limitedRetries: boolean = false, tokenOutEstimate: number = 120, streamingCallbacks?: Callbacks | Promise<any>           | Calls the language model with the given parameters, handling retries and rate limits.         |
| updateRateLimits    | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                       | Promise<void>          | Updates the rate limits for a given model based on the tokens added.                          |
| checkRateLimits     | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                       | Promise<void>          | Checks and waits if the rate limits for a given model are exceeded.                           |
| formatNumber        | number: number, fractions: number = 0                                                                         | string                 | Formats a number to a string with a specified number of fraction digits.                      |
| saveMemory          |                                                                                                              | Promise<void>          | Saves the current memory state to Redis.                                                      |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/baseAgent.js';
import winston from 'winston';
import { ChatOpenAI } from 'langchain/chat_models/openai';

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Example usage
const agent = new PolicySynthAgentBase();
agent.logger = logger; // Set the logger
agent.chat = new ChatOpenAI(); // Set the ChatOpenAI instance

// Example call to LLM
const messages = [{ text: 'Hello, world!' }];
agent.callLLM('stageName', { name: 'GPT-3', inTokenCostUSD: 0.01, outTokenCostUSD: 0.01, limitRPM: 60, limitTPM: 1000 }, messages)
  .then(response => {
    console.log('LLM response:', response);
  })
  .catch(error => {
    console.error('Error calling LLM:', error);
  });
```