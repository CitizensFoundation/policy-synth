# PolicySynthAgentBase

The `PolicySynthAgentBase` class provides foundational utilities for PolicySynth agents, including logging, message formatting, JSON parsing/repair, number formatting, and token counting for LLM messages. It is designed to be extended by more specialized agent classes.

## Properties

| Name        | Type            | Description                                      |
|-------------|-----------------|--------------------------------------------------|
| logger      | winston.Logger  | Winston logger instance for logging events.       |
| timeStart   | number          | Timestamp (ms) when the instance was created.     |

## Methods

| Name                   | Parameters                                                                 | Return Type         | Description                                                                                                 |
|------------------------|----------------------------------------------------------------------------|---------------------|-------------------------------------------------------------------------------------------------------------|
| constructor            | —                                                                          | PolicySynthAgentBase| Initializes the logger and sets the start time.                                                             |
| createSystemMessage    | content: string                                                            | PsModelMessage      | Creates a system message object for LLM input.                                                              |
| createHumanMessage     | content: string                                                            | PsModelMessage      | Creates a user (human) message object for LLM input.                                                        |
| getJsonBlock           | text: string                                                               | string \| null      | Extracts a JSON code block (```json ... ```) from a string, or returns null if not found.                   |
| repairJson             | text: string                                                               | string              | Attempts to repair malformed JSON using `jsonrepair`. Throws if repair fails.                               |
| parseJsonResponse      | response: string                                                           | T                   | Parses a JSON string, attempts repair if parsing fails, and returns the parsed object of type `T`.          |
| formatNumber           | number: number, fractions: number = 0                                      | string              | Formats a number with a specified number of fraction digits (default 0), using US locale.                   |
| getTokensFromMessages  | messages: PsModelMessage[]                                                 | Promise<number>     | Asynchronously counts the number of tokens in a list of LLM messages, using the `tiktoken` library.         |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/base/agentBase.js';

const agent = new PolicySynthAgentBase();

// Logging
agent.logger.info("Agent started");

// Creating messages
const sysMsg = agent.createSystemMessage("You are a helpful assistant.");
const userMsg = agent.createHumanMessage("What is the weather today?");

// Parsing JSON responses
const jsonString = '{"foo": "bar"}';
const parsed = agent.parseJsonResponse(jsonString); // { foo: "bar" }

// Formatting numbers
const formatted = agent.formatNumber(12345.678, 2); // "12,345.68"

// Counting tokens in messages
const messages = [
  agent.createSystemMessage("System prompt"),
  agent.createHumanMessage("User prompt")
];
agent.getTokensFromMessages(messages).then(tokenCount => {
  console.log(`Total tokens: ${tokenCount}`);
});
```

---

**File:** `@policysynth/agents/base/agentBase.js`