# PsAgentOrchestrator

This class orchestrates the execution of validation agents, processing an input through a chain of agents until a validation failure occurs or all agents have been executed.

## Methods

| Name    | Parameters                                      | Return Type                  | Description |
|---------|-------------------------------------------------|------------------------------|-------------|
| execute | initialAgent: PsValidationAgent, input: string | Promise<PsValidationAgentResult> | Executes the chain of validation agents starting with the initial agent, processing the given input, and returns the result of the validation process. |

## Example

```typescript
// Example usage of PsAgentOrchestrator
import { PsAgentOrchestrator } from '@policysynth/agents/validations/agentOrchestrator.js';
import { PsValidationAgent, PsValidationAgentResult } from './path/to/validationAgentTypes';

const orchestrator = new PsAgentOrchestrator();

// Assuming `initialAgent` is an instance of PsValidationAgent
// and `inputString` is the string to be validated
orchestrator.execute(initialAgent, inputString)
  .then((result: PsValidationAgentResult) => {
    if (result.isValid) {
      console.log('Validation passed');
    } else {
      console.error('Validation failed', result.validationErrors);
    }
  });
```