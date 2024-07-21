# PsBaseAgentRunner

The `PsBaseAgentRunner` class is an abstract class that extends the `PolicySynthAgent` class. It is responsible for setting up and running agents and connectors, managing their registration, and ensuring they are ready to process jobs. This class provides a framework for initializing, registering, and managing multiple instances of agent classes and connector classes.

## Properties

| Name                      | Type                              | Description                                                                 |
|---------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| agentsToRun               | `PolicySynthAgentQueue[]`         | An array of agent queues to be run.                                         |
| agentRegistry             | `PsAgentRegistry \| null`         | The registry for managing agents and connectors.                            |
| registeredAgentClasses    | `PsAgentClass[]`                  | An array of registered agent classes.                                       |
| registeredConnectorClasses| `PsAgentConnectorClass[]`         | An array of registered connector classes.                                   |
| agentClasses              | `PsAgentClassCreationAttributes[]`| Abstract property for agent class attributes.                               |
| connectorClasses          | `PsConnectorClassCreationAttributes[]`| Abstract property for connector class attributes.                           |

## Methods

| Name                       | Parameters                          | Return Type          | Description                                                                 |
|----------------------------|-------------------------------------|----------------------|-----------------------------------------------------------------------------|
| constructor                | -                                   | -                    | Initializes the `PsBaseAgentRunner` instance and checks for required environment variables. |
| setupAgents                | -                                   | `Promise<void>`      | Abstract method to be implemented by subclasses for setting up agents.      |
| setupAndRunAgents          | -                                   | `Promise<void>`      | Sets up and runs agents and connectors, ensuring they are ready for jobs.   |
| inspectDynamicMethods      | `obj: any, className: string`       | `void`               | Inspects and logs dynamic methods of a given object.                        |
| registerAgent              | `agentQueue: PolicySynthAgentQueue` | `Promise<void>`      | Registers an agent in the agent registry.                                   |
| registerConnectors         | -                                   | `Promise<void>`      | Registers connectors in the agent registry.                                 |
| getOrCreateAgentRegistry   | -                                   | `Promise<PsAgentRegistry>` | Retrieves or creates the agent registry.                                     |
| createAgentClassesIfNeeded | -                                   | `Promise<void>`      | Creates agent classes if they do not already exist in the database.         |
| createConnectorClassesIfNeeded | -                               | `Promise<void>`      | Creates connector classes if they do not already exist in the database.     |
| run                        | -                                   | `Promise<void>`      | Runs the setup and initialization process for agents and connectors.        |
| setupGracefulShutdown      | -                                   | `void`               | Sets up a graceful shutdown process for the application.                    |

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

  async setupAgents(): Promise<void> {
    // Implement your agent setup logic here
  }
}

const runner = new MyAgentRunner();
runner.run();
```

This example demonstrates how to extend the `PsBaseAgentRunner` class to create a custom agent runner. The `MyAgentRunner` class defines the agent and connector classes and implements the `setupAgents` method to set up the agents. The `runner.run()` method is called to start the setup and initialization process.