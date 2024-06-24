# PolicySynthScAgentBase

The `PolicySynthScAgentBase` class is designed to interact with a language model, manage memory, and handle rate limits for API calls. It includes methods for parsing and repairing JSON responses, managing rate limits, and saving memory states.

## Properties

| Name       | Type                | Description                                                                 |
|------------|---------------------|-----------------------------------------------------------------------------|
| memory     | PsSmarterCrowdsourcingMemoryData \| undefined | Optional memory data for the agent.                                           |
| logger     | winston.Logger      | Logger instance for logging information and errors.                          |
| timeStart  | number              | Timestamp indicating when the agent was instantiated.                        |
| chat       | ChatOpenAI \| undefined | Optional instance of the ChatOpenAI class for interacting with the language model. |
| rateLimits | PsModelRateLimitTracking   | Object to keep track of rate limits for different models.                    |

## Methods

| Name                    | Parameters                                                                 | Return Type         | Description                                                                                     |
|-------------------------|---------------------------------------------------------------------------|---------------------|-------------------------------------------------------------------------------------------------|
| constructor             | memory: PsSmarterCrowdsourcingMemoryData \| undefined = undefined                         | void                | Initializes the agent with optional memory data.                                                |
| static emptyDefaultStages | none                                                                      | object              | Returns an object with default stages for the agent.                                            |
| getJsonBlock            | text: string                                                               | string              | Extracts a JSON block from a given text.                                                        |
| fullLLMCostsForMemory   | none                                                                       | number \| undefined | Calculates the total cost of memory stages in terms of tokens.                                   |
| private repairJson      | text: string                                                               | string              | Repairs a given JSON string using the `jsonrepair` library.                                      |
| private parseJsonResponse | response: string                                                          | any                 | Parses a JSON response, attempting to repair it if parsing fails.                               |
| async callLLM           | stage: PsScMemoryStageTypes, modelConstants: PsBaseAIModelConstants, messages: BaseMessage[], parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks?: Callbacks | Promise<any>        | Calls the language model with the given parameters and handles retries and rate limits.          |
| private async updateRateLimits | model: PsBaseAIModelConstants, tokensToAdd: number               | Promise<void>       | Updates the rate limits for a given model by adding the current request and token count.         |
| private async checkRateLimits | model: PsBaseAIModelConstants, tokensToAdd: number                | Promise<void>       | Checks if the rate limits for a given model have been reached and waits if necessary.            |
| private addRequestTimestamp | model: PsBaseAIModelConstants                                      | void                | Adds a timestamp for the current request to the rate limits.                                     |
| private addTokenEntry    | model: PsBaseAIModelConstants, tokensToAdd: number                    | void                | Adds a token entry for the current request to the rate limits.                                   |
| private slideWindowForRequests | model: PsBaseAIModelConstants                                    | void                | Slides the window for request timestamps to remove old entries.                                  |
| private slideWindowForTokens | model: PsBaseAIModelConstants                                      | void                | Slides the window for token entries to remove old entries.                                       |
| private async getTokensFromMessages | messages: BaseMessage[]                                          | Promise<number>     | Gets the total number of tokens from a list of messages.                                         |
| private updateMemoryStages | stage: PsScMemoryStageTypes, tokensIn: number, tokensOut: number, modelConstants: PsBaseAIModelConstants | void                | Updates the memory stages with the given token counts and costs.                                 |
| formatNumber             | number: number, fractions = 0                                              | string              | Formats a number to a string with a specified number of decimal places.                          |
| async saveMemory         | none                                                                       | Promise<void>       | Saves the current memory state to Redis.                                                         |

## Example

```typescript
// Example usage of PolicySynthScAgentBase
import { PolicySynthScAgentBase } from '@policysynth/agents/baseAgent.js';

const agent = new PolicySynthScAgentBase();
agent.callLLM(
  'create-root-causes-search-queries',
  modelConstants,
  messages,
  true,
  false,
  120,
  streamingCallbacks
);
```