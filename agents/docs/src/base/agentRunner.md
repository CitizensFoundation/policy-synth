# PsBaseAgentRunner

The `PsBaseAgentRunner` is an abstract class responsible for managing the lifecycle of agents and connectors within a system. It handles the setup, registration, and execution of agents and connectors, ensuring they are properly initialized and running.

## Properties

| Name                      | Type                              | Description                                                                 |
|---------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| agentsToRun               | `PolicySynthAgentQueue[]`         | An array of agent queues to be executed.                                    |
| agentRegistry             | `PsAgentRegistry \| null`         | The registry for managing agents and connectors.                            |
| registeredAgentClasses    | `PsAgentClass[]`                  | A list of registered agent classes.                                         |
| registeredConnectorClasses| `PsAgentConnectorClass[]`         | A list of registered connector classes.                                     |
| agentClasses              | `PsAgentClassCreationAttributes[]`| Abstract property for defining agent classes to be created.                 |
| connectorClasses          | `PsAgentConnectorClassCreationAttributes[]` | Abstract property for defining connector classes to be created.             |

## Methods

| Name                        | Parameters                          | Return Type          | Description                                                                 |
|-----------------------------|-------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                 | -                                   | -                    | Initializes the agent runner and checks for necessary environment variables.|
| setupAgents                 | -                                   | `Promise<void>`      | Abstract method to be implemented for setting up agents.                    |
| setupAndRunAgents           | -                                   | `Promise<void>`      | Sets up and runs agents and connectors.                                     |
| inspectDynamicMethods       | `obj: any, className: string`       | `void`               | Logs the dynamic methods of a given object.                                 |
| registerAgent               | `agentQueue: PolicySynthAgentQueue` | `Promise<void>`      | Registers an agent with the agent registry.                                 |
| registerConnectors          | -                                   | `Promise<void>`      | Registers connectors with the agent registry.                               |
| getOrCreateAgentRegistry    | -                                   | `Promise<PsAgentRegistry>` | Retrieves or creates an agent registry.                                     |
| createAgentClassesIfNeeded  | -                                   | `Promise<void>`      | Creates agent classes if they do not already exist.                         |
| createConnectorClassesIfNeeded | -                                | `Promise<void>`      | Creates connector classes if they do not already exist.                     |
| run                         | -                                   | `Promise<void>`      | Runs the agent runner, setting up and executing agents and connectors.      |
| setupGracefulShutdown       | -                                   | `void`               | Sets up a graceful shutdown process for the agent runner.                   |

## Example

```typescript
import { PsBaseAgentRunner } from '@policysynth/agents/base/agentRunner.js';

class MyAgentRunner extends PsBaseAgentRunner {
  protected agentClasses = [...]; // Define your agent classes
  protected connectorClasses = [...]; // Define your connector classes

  async setupAgents() {
    // Implement your agent setup logic here
  }
}

const runner = new MyAgentRunner();
runner.run();
```

This class is designed to be extended, allowing for the implementation of specific agent and connector setup logic in the `setupAgents` method. It provides a robust framework for managing the lifecycle of agents and connectors, ensuring they are properly initialized, registered, and executed.