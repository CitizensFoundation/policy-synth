# PolicySynthAgentBase

The `PolicySynthAgentBase` class provides a foundational base for PolicySynth agents, offering robust logging, JSON parsing/repair utilities, message formatting for AI models, and token counting for model messages. It is designed to be extended by more specialized agent classes.

## Properties

| Name        | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| timeStart   | number    | Timestamp (ms) when the agent instance was created. |
| logger      | winston.Logger | Logger instance for the agent (child of root logger). |

## Static Properties

| Name        | Type            | Description                                      |
|-------------|-----------------|--------------------------------------------------|
| logger      | winston.Logger  | Static getter for the root logger, namespaced by class. |

## Methods

| Name                  | Parameters                                                                 | Return Type         | Description                                                                                  |
|-----------------------|----------------------------------------------------------------------------|---------------------|----------------------------------------------------------------------------------------------|
| constructor           | —                                                                          | PolicySynthAgentBase| Initializes the agent, sets up the logger and start time.                                    |
| createSystemMessage   | content: string                                                            | PsModelMessage      | Creates a system message object for AI model input.                                          |
| createHumanMessage    | content: string                                                            | PsModelMessage      | Creates a user message object for AI model input.                                            |
| getJsonBlock          | text: string                                                               | string \| null      | Extracts a JSON code block (```json ... ```) from a string, or returns null if not found.    |
| repairJson            | text: string                                                               | string              | Attempts to repair malformed JSON using `jsonrepair`. Throws if repair fails.                |
| parseJsonResponse     | response: string                                                           | T                   | Parses a JSON string, attempts repair if parsing fails, and returns the parsed object.       |
| formatNumber          | number: number, fractions?: number                                         | string              | Formats a number with a specified number of fraction digits (default: 0).                    |
| getTokensFromMessages | messages: PsModelMessage[]                                                 | Promise<number>     | Calculates the total number of tokens in a list of model messages (using tiktoken).          |

## Example

```typescript
import { PolicySynthAgentBase } from '@policysynth/agents/base/agentBase.js';

class MyAgent extends PolicySynthAgentBase {
  async run() {
    this.logger.info("Agent started at " + this.timeStart);

    // Create messages for an AI model
    const systemMsg = this.createSystemMessage("You are a helpful assistant.");
    const userMsg = this.createHumanMessage("What is the capital of France?");
    const messages = [systemMsg, userMsg];

    // Count tokens
    const tokenCount = await this.getTokensFromMessages(messages);
    this.logger.info(`Token count: ${tokenCount}`);

    // Parse a JSON response (with possible repair)
    const aiResponse = '```json\n{"answer": "Paris"}\n```';
    const parsed = this.parseJsonResponse<{ answer: string }>(aiResponse);
    this.logger.info(`AI answered: ${parsed.answer}`);

    // Format a number
    const formatted = this.formatNumber(12345.678, 2); // "12,345.68"
    this.logger.info(`Formatted number: ${formatted}`);
  }
}

const agent = new MyAgent();
agent.run();
```

---

**Notes:**
- The logger is based on Winston and supports Airbrake integration if environment variables are set.
- The class provides robust JSON parsing and repair, useful for handling AI model outputs.
- Token counting is compatible with OpenAI's tiktoken library and is tailored for GPT-4o by default.
- Extend this class to build custom PolicySynth agents with consistent logging and utility methods.