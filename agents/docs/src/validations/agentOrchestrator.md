# PsAgentOrchestrator

The `PsAgentOrchestrator` class is responsible for orchestrating the execution of a series of validation agents. It takes an initial agent and an input string, and it processes the input through the chain of agents until a final validation result is obtained.

## Methods

### `execute`

Executes the chain of validation agents starting from the initial agent.

| Name          | Parameters                                      | Return Type                  | Description                                                                 |
|---------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `execute`     | `initialAgent: PsValidationAgent, input: string`| `Promise<PsValidationAgentResult>` | Executes the chain of validation agents and returns the final validation result. |

#### Parameters

- `initialAgent` (`PsValidationAgent`): The initial validation agent to start the execution chain.
- `input` (`string`): The input string to be validated by the agents.

#### Returns

- `Promise<PsValidationAgentResult>`: A promise that resolves to the final validation result.

#### Example

```typescript
import { PsAgentOrchestrator } from '@policysynth/agents/validations/agentOrchestrator.js';
import { PsValidationAgent, PsValidationAgentResult } from '@policysynth/agents/types.js';

class ExampleAgent implements PsValidationAgent {
  name: string = 'ExampleAgent';

  async execute(input: string): Promise<PsValidationAgentResult> {
    // Example validation logic
    if (input === 'valid') {
      return { isValid: true };
    } else {
      return { isValid: false, validationErrors: ['Invalid input'] };
    }
  }
}

const orchestrator = new PsAgentOrchestrator();
const initialAgent = new ExampleAgent();
const input = 'valid';

orchestrator.execute(initialAgent, input).then(result => {
  console.log(result);
});
```

In this example, the `PsAgentOrchestrator` is used to execute a chain of validation agents starting with `ExampleAgent`. The input string is validated, and the final result is logged to the console.