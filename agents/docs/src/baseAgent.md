# PolicySynthAgentBase

This class represents the base agent for policy synthesis, handling memory management, logging, JSON parsing, rate limiting, and communication with language models.

## Properties

| Name         | Type                                            | Description                                      |
|--------------|-------------------------------------------------|--------------------------------------------------|
| memory       | IEngineInnovationMemoryData \| undefined       | Optional memory storage for the agent.           |
| logger       | winston.Logger                                  | Logger instance for logging purposes.            |
| timeStart    | number                                          | Timestamp marking the start of the agent.        |
| chat         | ChatOpenAI \| undefined                         | Optional ChatOpenAI instance for communication.  |
| rateLimits   | IEngineRateLimits                               | Object to track and manage rate limits.          |

## Methods

| Name              | Parameters                                                                                                                                                                                                 | Return Type            | Description                                                                                   |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| getJsonBlock      | text: string                                                                                                                                                                                               | string                 | Extracts a JSON block from a given text.                                                     |
| fullLLMCostsForMemory | -                                                                                                                                                                                                          | number                 | Calculates the total LLM costs for memory based on tokens in and out.                        |
| getRepairedJson   | text: string                                                                                                                                                                                               | any                    | Attempts to repair and parse a given JSON string.                                            |
| callLLM           | stage: IEngineStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean = true, limitedRetries: boolean = false, tokenOutEstimate: number = 120, streamingCallbacks?: Callbacks | Promise<any>           | Calls the language model and handles retries, rate limiting, and optional JSON parsing.      |
| updateRateLimits  | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                                                                                                                     | Promise<void>          | Updates the rate limits for a given model based on the tokens added.                         |
| checkRateLimits   | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                                                                                                                     | Promise<void>          | Checks and enforces rate limits for a given model, potentially delaying execution.            |
| formatNumber      | number: number, fractions: number = 0                                                                                                                                                                       | string                 | Formats a number to a string with a specified number of fractional digits.                    |
| saveMemory        | -                                                                                                                                                                                                          | Promise<void>          | Saves the current state of the memory to a Redis instance.                                   |

## Example

```javascript
// Example usage of PolicySynthAgentBase
import { PolicySynthAgentBase } from '@policysynth/agents/baseAgent.js';
import { BaseMessage } from "langchain/schema";
import { IEngineConstants } from "./constants.js";
import { ChatOpenAI } from "langchain/chat_models/openai";

const agent = new PolicySynthAgentBase();

// Example of calling a language model
const messages = [new BaseMessage({ text: "Hello, world!" })];
const modelConstants = IEngineConstants.someModelConstants; // This should be defined according to your constants
agent.callLLM("someStage", modelConstants, messages).then(response => {
  console.log("LLM Response:", response);
}).catch(error => {
  console.error("Error calling LLM:", error);
});
```