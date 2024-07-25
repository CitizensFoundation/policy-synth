# PsBaseAgentRunner

The `PsBaseAgentRunner` class is an abstract class that extends the `PolicySynthAgent` class. It is responsible for setting up and running agents and connectors, managing their registration, and handling graceful shutdowns.

## Properties

| Name                      | Type                              | Description                                                                 |
|---------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| `agentsToRun`             | `PolicySynthAgentQueue[]`         | An array of agent queues to be run.                                         |
| `agentRegistry`           | `PsAgentRegistry \| null`         | The agent registry instance.                                                |
| `registeredAgentClasses`  | `PsAgentClass[]`                  | An array of registered agent classes.                                       |
| `registeredConnectorClasses` | `PsAgentConnectorClass[]`      | An array of registered connector classes.                                   |
| `agentClasses`            | `PsAgentClassCreationAttributes[]`| An abstract property for agent class creation attributes.                   |
| `connectorClasses`        | `PsConnectorClassCreationAttributes[]` | An abstract property for connector class creation attributes.           |

## Methods

| Name                       | Parameters                          | Return Type          | Description                                                                 |
|----------------------------|-------------------------------------|----------------------|-----------------------------------------------------------------------------|
| `constructor`              | -                                   | -                    | Initializes the `PsBaseAgentRunner` instance and checks for required environment variables. |
| `setupAgents`              | -                                   | `Promise<void>`      | An abstract method to be implemented by subclasses for setting up agents.   |
| `setupAndRunAgents`        | -                                   | `Promise<void>`      | Sets up and runs agents and connectors, and registers them.                 |
| `inspectDynamicMethods`    | `obj: any, className: string`       | `void`               | Inspects and logs dynamic methods of a given object.                        |
| `registerAgent`            | `agentQueue: PolicySynthAgentQueue` | `Promise<void>`      | Registers an agent in the agent registry.                                   |
| `registerConnectors`       | -                                   | `Promise<void>`      | Registers connectors in the agent registry.                                 |
| `getOrCreateAgentRegistry` | -                                   | `Promise<PsAgentRegistry>` | Retrieves or creates an agent registry.                                 |
| `createAgentClassesIfNeeded` | -                                 | `Promise<void>`      | Creates agent classes if they do not already exist in the database.         |
| `createConnectorClassesIfNeeded` | -                             | `Promise<void>`      | Creates connector classes if they do not already exist in the database.     |
| `run`                      | -                                   | `Promise<void>`      | Runs the setup and execution of agents, and handles errors.                 |
| `setupGracefulShutdown`    | -                                   | `void`               | Sets up graceful shutdown handling for the process.                         |

## Example

```typescript
import { PsBaseAgentRunner } from '@policysynth/agents/base/agentRunner.js';
import { PolicySynthAgentQueue } from './agentQueue.js';
import { PsAgentClassCreationAttributes, PsConnectorClassCreationAttributes } from '../dbModels/agentClass.js';

class MyAgentRunner extends PsBaseAgentRunner {
  protected agentClasses: PsAgentClassCreationAttributes[] = [
    // Define your agent classes here
  ];

  protected connectorClasses: PsConnectorClassCreationAttributes[] = [
    // Define your connector classes here
  ];

  async setupAgents() {
    // Implement your agent setup logic here
  }
}

const runner = new MyAgentRunner();
runner.run();
```

This example demonstrates how to extend the `PsBaseAgentRunner` class to create a custom agent runner. You need to define the agent and connector classes and implement the `setupAgents` method with your specific logic.