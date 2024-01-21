# PsAgentOrchestrator

The `PsAgentOrchestrator` class is responsible for executing a chain of validation agents on a given input. It starts with an initial agent and continues with subsequent agents as long as the validation is successful.

## Properties

This class does not have explicit properties.

## Methods

| Name     | Parameters                                      | Return Type                     | Description                                                                                   |
|----------|-------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| execute  | initialAgent: PsValidationAgent, input: string | Promise<PsValidationAgentResult> | Executes the chain of validation agents on the input and returns the final validation result. |

## Examples

```typescript
// Example usage of PsAgentOrchestrator
const orchestrator = new PsAgentOrchestrator();
const initialAgent = new PsValidationAgent(); // Assuming PsValidationAgent is defined elsewhere
const input = "some input string";

orchestrator.execute(initialAgent, input)
  .then(result => {
    if (result.isValid) {
      console.log("Validation passed");
    } else {
      console.error("Validation failed", result.validationErrors);
    }
  })
  .catch(error => {
    console.error("An error occurred during validation", error);
  });
```