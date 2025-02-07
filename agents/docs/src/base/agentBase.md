# PolicySynthAgentBase

The `PolicySynthAgentBase` class provides a foundational structure for creating agents in the PolicySynth framework. It includes methods for logging, JSON parsing and repair, message creation, and token counting.

## Properties

| Name       | Type            | Description                                      |
|------------|-----------------|--------------------------------------------------|
| logger     | winston.Logger  | Logger instance for logging messages and errors. |
| timeStart  | number          | Timestamp of when the instance was created.      |

## Methods

| Name                  | Parameters                          | Return Type | Description                                                                 |
|-----------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor           | None                                | void        | Initializes the logger and sets the start time.                             |
| createSystemMessage   | content: string                     | PsModelMessage | Creates a system message with the given content.                            |
| createHumanMessage    | content: string                     | PsModelMessage | Creates a human (user) message with the given content.                      |
| getJsonBlock          | text: string                        | string \| null | Extracts a JSON block from a given text if it exists.                       |
| repairJson            | text: string                        | string      | Attempts to repair a malformed JSON string.                                 |
| parseJsonResponse     | response: string                    | T           | Parses a JSON response, attempting repair if parsing fails.                 |
| formatNumber          | number: number, fractions: number = 0 | string      | Formats a number to a string with specified fraction digits.                |
| getTokensFromMessages | messages: PsModelMessage[]          | Promise<number> | Calculates the number of tokens in a list of messages using a specific encoding. |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/base/agentBase.js';

const agent = new PolicySynthAgentBase();
const systemMessage = agent.createSystemMessage("System initialization complete.");
const humanMessage = agent.createHumanMessage("Hello, how can I assist you today?");
const jsonResponse = agent.parseJsonResponse('{"key": "value"}');
const formattedNumber = agent.formatNumber(12345.6789, 2);

(async () => {
  const tokenCount = await agent.getTokensFromMessages([systemMessage, humanMessage]);
  console.log(`Total tokens: ${tokenCount}`);
})();
```

This class is designed to be extended by other agent classes that require these foundational functionalities. It leverages the `winston` library for logging and provides utility methods for handling JSON data and calculating token usage, which is essential for interacting with language models.