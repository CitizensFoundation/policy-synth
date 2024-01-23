# PolicySynthAgentBase

The `PolicySynthAgentBase` class is responsible for handling interactions with a language model, managing rate limits, and maintaining a memory state. It includes methods for parsing JSON, calling the language model, and saving memory data to Redis.

## Properties

| Name         | Type                                  | Description                                      |
|--------------|---------------------------------------|--------------------------------------------------|
| memory       | IEngineInnovationMemoryData \| undefined | Optional memory state of the agent.              |
| logger       | winston.Logger                        | Logger instance for logging messages.            |
| timeStart    | number                                | Timestamp indicating the start time.             |
| chat         | ChatOpenAI \| undefined               | Instance of ChatOpenAI for interacting with the language model. |
| rateLimits   | IEngineRateLimits                     | Private property to track rate limits.           |

## Methods

| Name             | Parameters                                                                                   | Return Type | Description                                                                                   |
|------------------|----------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| getJsonBlock     | text: string                                                                                 | string      | Extracts a JSON block from a string.                                                          |
| getRepairedJson  | text: string                                                                                 | any         | Attempts to repair and parse a JSON string.                                                   |
| callLLM          | stage: IEngineStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Callbacks | Promise<any> | Calls the language model and handles retries, rate limits, and JSON parsing.                  |
| updateRateLimits | model: IEngineBaseAIModelConstants, tokensToAdd: number                                      | Promise<void> | Updates the rate limits for a given model based on token usage.                               |
| checkRateLimits  | model: IEngineBaseAIModelConstants, tokensToAdd: number                                      | Promise<void> | Checks if the current rate limits have been exceeded and waits if necessary.                  |
| formatNumber     | number: number, fractions: number = 0                                                        | string      | Formats a number to a string with a specified number of fractional digits.                    |
| saveMemory       | -                                                                                            | Promise<void> | Saves the current memory state to Redis.                                                      |

## Examples

```typescript
// Example usage of the PolicySynthAgentBase class
const agent = new PolicySynthAgentBase();
const jsonText = `{
  "key": "value"
}`;

try {
  const jsonBlock = agent.getJsonBlock(jsonText);
  console.log(jsonBlock); // Outputs the JSON block from the text
} catch (error) {
  console.error(error);
}

try {
  const repairedJson = agent.getRepairedJson(jsonText);
  console.log(repairedJson); // Outputs the repaired and parsed JSON object
} catch (error) {
  console.error(error);
}

// Example of calling the language model
const messages = [{ text: "Hello, world!" }];
agent.callLLM("stage", modelConstants, messages, true, false, 120)
  .then(response => {
    console.log(response); // Outputs the response from the language model
  })
  .catch(error => {
    console.error(error);
  });
```

Please note that the actual implementation of `IEngineInnovationMemoryData`, `IEngineRateLimits`, `IEngineStageTypes`, `IEngineBaseAIModelConstants`, `BaseMessage`, and `Callbacks` are not provided in the example above. These would need to be defined elsewhere in your codebase or imported from appropriate modules.