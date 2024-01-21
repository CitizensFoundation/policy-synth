# Base

The `Base` class is a foundational component that provides various functionalities such as JSON parsing, rate limiting, logging, and interaction with a language model through the `ChatOpenAI` class. It also includes memory management and error handling for JSON-related operations.

## Properties

| Name        | Type                              | Description                                   |
|-------------|-----------------------------------|-----------------------------------------------|
| memory      | IEngineInnovationMemoryData       | Optional memory data for the engine.          |
| logger      | winston.Logger                    | Logger instance for logging information.      |
| timeStart   | number                            | Timestamp indicating the start time.          |
| chat        | ChatOpenAI                        | Optional instance of the ChatOpenAI class.    |
| rateLimits  | IEngineRateLimits                 | Private property to manage rate limits.       |

## Methods

| Name            | Parameters                                                                                   | Return Type | Description                                                                 |
|-----------------|----------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| getJsonBlock    | text: string                                                                                 | string      | Extracts a JSON block from the provided text.                               |
| getRepairedJson | text: string                                                                                 | any         | Attempts to repair and parse a JSON string, returning the parsed object.    |
| callLLM         | stage: IEngineStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson: boolean, limitedRetries: boolean, tokenOutEstimate: number, streamingCallbacks?: Callbacks | Promise<any> | Calls the language model and handles retries, rate limiting, and JSON parsing. |
| updateRateLimits | model: IEngineBaseAIModelConstants, tokensToAdd: number                                      | Promise<void> | Updates the rate limits for a given model based on token usage.             |
| checkRateLimits | model: IEngineBaseAIModelConstants, tokensToAdd: number                                      | Promise<void> | Checks the current rate limits and waits if limits are exceeded.            |
| formatNumber    | number: number, fractions: number                                                             | string      | Formats a number to a string with specified fraction digits.                |
| saveMemory      | -                                                                                            | Promise<void> | Saves the current memory state to a Redis instance.                         |

## Examples

```typescript
// Example usage of the Base class
const baseInstance = new Base();
baseInstance.logger.info("Logging an informational message");

// Example of calling the callLLM method
const messages: BaseMessage[] = [{ text: "Hello, world!" }];
const stage: IEngineStageTypes = "exampleStage";
const modelConstants: IEngineBaseAIModelConstants = {
  name: "exampleModel",
  inTokenCostUSD: 0.001,
  outTokenCostUSD: 0.001,
  limitRPM: 60,
  limitTPM: 1000
};

baseInstance.callLLM(stage, modelConstants, messages).then(response => {
  console.log(response);
}).catch(error => {
  console.error("An error occurred:", error);
});
```

Please note that the actual implementation of `IEngineInnovationMemoryData`, `IEngineRateLimits`, `IEngineStageTypes`, `IEngineBaseAIModelConstants`, and `BaseMessage` are not provided in the example above. These would need to be defined elsewhere in your codebase for the example to work correctly.