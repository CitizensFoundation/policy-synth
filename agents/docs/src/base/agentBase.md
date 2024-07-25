# PolicySynthAgentBase

The `PolicySynthAgentBase` class provides a foundational structure for creating agents within the PolicySynth framework. It includes methods for logging, message creation, JSON parsing and repairing, number formatting, and token counting.

## Properties

| Name       | Type            | Description                                      |
|------------|-----------------|--------------------------------------------------|
| logger     | winston.Logger  | Logger instance for logging messages and errors. |
| timeStart  | number          | Timestamp when the instance was created.         |

## Methods

| Name                | Parameters                                                                 | Return Type       | Description                                                                 |
|---------------------|----------------------------------------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| constructor         | None                                                                       | void              | Initializes the logger and sets the start time.                             |
| createSystemMessage | content: string                                                            | PsModelMessage    | Creates a system message with the given content.                            |
| createHumanMessage  | content: string                                                            | PsModelMessage    | Creates a human (user) message with the given content.                      |
| getJsonBlock        | text: string                                                               | string \| null    | Extracts a JSON block from a given text.                                    |
| repairJson          | text: string                                                               | string            | Attempts to repair a malformed JSON string.                                 |
| parseJsonResponse   | response: string                                                           | T                 | Parses a JSON response, attempting to repair it if parsing fails.           |
| formatNumber        | number: number, fractions: number = 0                                      | string            | Formats a number to a specified number of decimal places.                   |
| getTokensFromMessages | messages: PsModelMessage[]                                               | Promise<number>   | Calculates the number of tokens in a list of messages.                      |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/base/agentBase.js';

class MyAgent extends PolicySynthAgentBase {
  constructor() {
    super();
  }

  async processMessages(messages: PsModelMessage[]) {
    const tokenCount = await this.getTokensFromMessages(messages);
    this.logger.info(`Total tokens: ${tokenCount}`);
  }
}

const agent = new MyAgent();
const messages = [
  agent.createSystemMessage("System message content"),
  agent.createHumanMessage("User message content")
];

agent.processMessages(messages);
```

## Detailed Method Descriptions

### constructor

Initializes the logger and sets the start time.

### createSystemMessage

Creates a system message with the given content.

**Parameters:**
- `content` (string): The content of the system message.

**Returns:**
- `PsModelMessage`: The created system message.

### createHumanMessage

Creates a human (user) message with the given content.

**Parameters:**
- `content` (string): The content of the human message.

**Returns:**
- `PsModelMessage`: The created human message.

### getJsonBlock

Extracts a JSON block from a given text.

**Parameters:**
- `text` (string): The text containing the JSON block.

**Returns:**
- `string | null`: The extracted JSON block, or null if not found.

### repairJson

Attempts to repair a malformed JSON string.

**Parameters:**
- `text` (string): The malformed JSON string.

**Returns:**
- `string`: The repaired JSON string.

### parseJsonResponse

Parses a JSON response, attempting to repair it if parsing fails.

**Parameters:**
- `response` (string): The JSON response string.

**Returns:**
- `T`: The parsed JSON object.

### formatNumber

Formats a number to a specified number of decimal places.

**Parameters:**
- `number` (number): The number to format.
- `fractions` (number, optional): The number of decimal places. Defaults to 0.

**Returns:**
- `string`: The formatted number.

### getTokensFromMessages

Calculates the number of tokens in a list of messages.

**Parameters:**
- `messages` (PsModelMessage[]): The list of messages.

**Returns:**
- `Promise<number>`: The total number of tokens.
```