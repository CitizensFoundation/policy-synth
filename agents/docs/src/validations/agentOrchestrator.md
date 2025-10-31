# PsAgentOrchestrator

The `PsAgentOrchestrator` class is responsible for orchestrating the execution of a chain of validation agents. It sequentially executes each agent in the chain, passing the same input to each, and stops the process if any agent returns an invalid result or validation errors.

## Methods

| Name     | Parameters                                                                 | Return Type                        | Description                                                                                                 |
|----------|----------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| execute  | initialAgent: PsValidationAgent, input: string                             | Promise&lt;PsValidationAgentResult&gt; | Executes a chain of validation agents starting from `initialAgent` with the provided `input`. Stops and returns immediately if an agent returns an invalid result or validation errors. Otherwise, continues to the next agent in the chain. |

### Method Details

#### execute

- **Parameters:**
  - `initialAgent` (`PsValidationAgent`): The first agent in the validation chain.
  - `input` (`string`): The input string to be validated by the agents.
- **Returns:** `Promise<PsValidationAgentResult>`
- **Description:**  
  This method starts with the `initialAgent` and calls its `execute` method with the provided `input`. If the result is valid and there are no validation errors, it proceeds to the next agent (if any) specified in `result.nextAgent`. If an agent returns an invalid result or any validation errors, the process stops and the result is returned immediately. If all agents validate successfully, a default valid result is returned.

## Example

```typescript
import { PsAgentOrchestrator } from '@policysynth/agents/validations/agentOrchestrator.js';

// Assume you have implementations for PsValidationAgent and PsValidationAgentResult
const orchestrator = new PsAgentOrchestrator();

const initialAgent: PsValidationAgent = {
  name: "FirstAgent",
  async execute(input: string): Promise<PsValidationAgentResult> {
    // ...validation logic...
    return { isValid: true, nextAgent: undefined };
  }
};

const input = "Some input to validate";

orchestrator.execute(initialAgent, input)
  .then(result => {
    if (result.isValid) {
      console.log("Validation passed!");
    } else {
      console.error("Validation failed:", result.validationErrors);
    }
  });
```

---

**Type References:**

- `PsValidationAgent`: An interface representing a validation agent with a `name` and an `execute` method.
- `PsValidationAgentResult`: The result returned by a validation agent, including `isValid`, optional `validationErrors`, and an optional `nextAgent`.