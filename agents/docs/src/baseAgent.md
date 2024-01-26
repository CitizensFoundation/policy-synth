# PolicySynthAgentBase

This class represents the base agent for policy synthesis, handling memory management, logging, and interactions with language models.

## Properties

| Name         | Type                                            | Description                                      |
|--------------|-------------------------------------------------|--------------------------------------------------|
| memory       | IEngineInnovationMemoryData \| undefined       | Optional memory data for the agent.              |
| logger       | winston.Logger                                  | Logger instance for logging.                     |
| timeStart    | number                                          | Timestamp marking the start of the agent.        |
| chat         | ChatOpenAI \| undefined                         | Optional ChatOpenAI instance for model calls.    |
| rateLimits   | IEngineRateLimits                               | Object to track rate limits for model calls.     |

## Methods

| Name              | Parameters                                                                                                                                                                                                 | Return Type            | Description                                                                                   |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| getJsonBlock      | text: string                                                                                                                                                                                               | string                 | Extracts a JSON block from a given text.                                                      |
| fullLLMCostsForMemory | -                                                                                                                                                                                                          | number                 | Calculates the total LLM costs for memory based on tokens in and out.                         |
| getRepairedJson   | text: string                                                                                                                                                                                               | any                    | Attempts to repair and parse a JSON string, extracting from a JSON block if necessary.        |
| callLLM           | stage: IEngineStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Callbacks    | Promise<any>           | Calls the language model with retries and rate limiting, optionally parsing the JSON response.|
| updateRateLimits  | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                                                                                                                     | Promise<void>          | Updates the rate limits for a given model based on tokens added.                              |
| checkRateLimits   | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                                                                                                                     | Promise<void>          | Checks and enforces rate limits for a given model, pausing execution if limits are exceeded.  |
| formatNumber      | number: number, fractions: number = 0                                                                                                                                                                       | string                 | Formats a number to a string with a specified number of fractional digits.                    |
| saveMemory        | -                                                                                                                                                                                                          | Promise<void>          | Saves the current memory state to Redis.                                                      |

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

// Create a new PolicySynthAgentBase instance
const agent = new PolicySynthAgentBase(undefined);

// Optionally, set up a ChatOpenAI instance for the agent
agent.chat = new ChatOpenAI('your_openai_api_key');

// Example usage of callLLM method
const messages = [{ text: 'Hello, world!', type: 'message' }];
agent.callLLM('stageType', { name: 'modelName', inTokenCostUSD: 0.01, outTokenCostUSD: 0.01, limitRPM: 60, limitTPM: 1000 }, messages)
  .then(response => {
    console.log('LLM response:', response);
  })
  .catch(error => {
    console.error('Error calling LLM:', error);
  });
```