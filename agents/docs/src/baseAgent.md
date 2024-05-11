# PolicySynthAgentBase

This class encapsulates the base functionalities for a policy synthesis agent, including memory management, logging, and interaction with language models.

## Properties

| Name         | Type                          | Description                                   |
|--------------|-------------------------------|-----------------------------------------------|
| memory       | PsBaseMemoryData \| undefined | Optional memory data for the agent.           |
| logger       | winston.Logger                | Logger instance for logging information.      |
| timeStart    | number                        | Timestamp when the agent was instantiated.    |
| chat         | ChatOpenAI \| undefined       | Optional ChatOpenAI instance for API calls.   |
| rateLimits   | IEngineRateLimits             | Rate limits for API calls.                    |

## Methods

| Name                  | Parameters                                                                                                      | Return Type            | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| getJsonBlock          | text: string                                                                                                    | string                 | Extracts a JSON block from a text string.                                   |
| fullLLMCostsForMemory | -                                                                                                               | number \| undefined    | Calculates the full LLM costs for the memory stages.                        |
| getRepairedJson       | text: string                                                                                                    | any                    | Attempts to repair and parse a JSON string.                                 |
| callLLM               | stage: PsMemoryStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Callbacks | any                    | Calls the LLM and handles retries, rate limits, and parsing.                |
| updateRateLimits      | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                         | Promise<void>          | Updates the rate limits for a given model based on the tokens added.        |
| checkRateLimits       | model: IEngineBaseAIModelConstants, tokensToAdd: number                                                         | Promise<void>          | Checks and enforces rate limits for a given model.                          |
| formatNumber          | number: number, fractions: number = 0                                                                           | string                 | Formats a number to a string with specified decimal places.                 |
| saveMemory            | -                                                                                                               | Promise<void>          | Saves the current memory state to Redis.                                    |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/baseAgent.js';

// Initialize the agent with optional memory data
const agent = new PolicySynthAgentBase();

// Example usage of getJsonBlock method
try {
  const jsonContent = agent.getJsonBlock("Some text ```json {\"key\": \"value\"} ``` more text");
  console.log(jsonContent); // Outputs: {"key": "value"}
} catch (error) {
  console.error("Failed to extract JSON block:", error);
}

// Example usage of callLLM method
const messages = [new BaseMessage("Hello, world!")];
agent.callLLM("stageType", modelConstants, messages, true, false, 120)
  .then(response => {
    console.log("LLM response:", response);
  })
  .catch(error => {
    console.error("Failed to call LLM:", error);
  });
```