# PsBaseAgentRunner

An abstract base class for running and managing PolicySynth agents and connectors. It handles agent/connector registration, setup, lifecycle management, and graceful shutdown. Designed to be extended for specific agent runner implementations.

**File:** `@policysynth/agents/base/agentRunner.js`

---

## Properties

| Name                      | Type                                                        | Description                                                                                   |
|---------------------------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `agentsToRun`             | `PolicySynthAgentQueue[]`                                   | List of agent queues to be run.                                                               |
| `agentRegistry`           | `PsAgentRegistry \| null`                                   | The agent registry instance, or null if not initialized.                                      |
| `registeredAgentClasses`  | `PsAgentClass[]`                                            | List of agent classes registered with the registry.                                           |
| `registeredConnectorClasses` | `PsAgentConnectorClass[]`                                | List of connector classes registered with the registry.                                       |
| `agentClasses`            | `PsAgentClassCreationAttributes[]` (abstract)               | List of agent class definitions to be managed (must be defined by subclass).                  |
| `connectorClasses`        | `PsAgentConnectorClassCreationAttributes[]` (abstract)      | List of connector class definitions to be managed (must be defined by subclass).              |

---

## Constructor

#### `constructor()`

- Initializes the base agent runner.
- Throws an error if the `YP_USER_ID_FOR_AGENT_CREATION` environment variable is not set.

---

## Methods

| Name                              | Parameters                                                                 | Return Type                | Description                                                                                                   |
|----------------------------------- |----------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------|
| `setupAgents`                     | none                                                                       | `Promise<void>`            | **Abstract.** Subclasses must implement this to set up agents and populate `agentsToRun`.                     |
| `setupAndRunAgents`               | none                                                                       | `Promise<void>`            | Connects to DB, initializes models, sets up registry, creates classes, sets up agents, and starts all agents. |
| `inspectDynamicMethods`           | `obj: any, className: string`                                              | `void`                     | Logs all methods (including dynamically added) of the given object for debugging.                             |
| `registerAgent`                   | `agentQueue: PolicySynthAgentQueue`                                        | `Promise<void>`            | Registers an agent class with the agent registry.                                                             |
| `registerConnectors`              | none                                                                       | `Promise<void>`            | Registers all connector classes with the agent registry.                                                      |
| `getOrCreateAgentRegistry`        | none                                                                       | `Promise<PsAgentRegistry>` | Finds or creates the agent registry in the database.                                                          |
| `createAgentClassesIfNeeded`      | none                                                                       | `Promise<void>`            | Ensures all agent classes in `agentClasses` exist in the database, creating them if needed.                   |
| `createConnectorClassesIfNeeded`  | none                                                                       | `Promise<void>`            | Ensures all connector classes in `connectorClasses` exist in the database, creating them if needed.           |
| `run`                             | none                                                                       | `Promise<void>`            | Main entry point: sets up graceful shutdown and runs all agents.                                              |
| `setupGracefulShutdown`           | none                                                                       | `void`                     | Sets up handlers for SIGTERM and SIGINT to gracefully pause/unregister agents and connectors.                 |

---

## Example

```typescript
import { PsBaseAgentRunner } from '@policysynth/agents/base/agentRunner.js';
import { MyAgentQueue } from './myAgentQueue.js';
import { myAgentClasses, myConnectorClasses } from './myAgentDefinitions.js';

class MyAgentRunner extends PsBaseAgentRunner {
  protected agentClasses = myAgentClasses;
  protected connectorClasses = myConnectorClasses;

  async setupAgents() {
    // Example: Add your agent queues to agentsToRun
    this.agentsToRun.push(new MyAgentQueue(/* ...args */));
  }
}

const runner = new MyAgentRunner();
runner.run();
```

---

## Usage Notes

- **Subclassing:** You must extend `PsBaseAgentRunner` and implement the `setupAgents()` method, as well as provide `agentClasses` and `connectorClasses`.
- **Environment:** The environment variable `YP_USER_ID_FOR_AGENT_CREATION` must be set to a valid user ID for agent/connector creation.
- **Graceful Shutdown:** Handles SIGTERM (Docker/K8s) and SIGINT (Ctrl+C) to pause workers and optionally unregister agents/connectors.
- **Database:** Uses Sequelize models for agent/connector/registry persistence.
- **Logging:** Uses `this.logger` for info/debug/error output.

---

## Key Responsibilities

- **Agent/Connector Registration:** Ensures all agent and connector classes are present in the database and registered with the agent registry.
- **Agent Queue Management:** Sets up and starts all agent queues, making them ready to process jobs.
- **Graceful Shutdown:** Pauses all agent queues and optionally unregisters them from the registry on shutdown signals.
- **Extensibility:** Designed to be extended for custom agent runner implementations.

---

## Related Types

- `PolicySynthAgentQueue`
- `PsAgentRegistry`
- `PsAgentClass`
- `PsAgentConnectorClass`
- `PsAgentClassCreationAttributes`
- `PsAgentConnectorClassCreationAttributes`

---

## See Also

- [PolicySynthAgentBase](./agentBase.js)
- [PolicySynthAgentQueue](./agentQueue.js)
- [PsAgentRegistry](../dbModels/agentRegistry.js)
- [PsAgentClass](../dbModels/agentClass.js)
- [PsAgentConnectorClass](../dbModels/agentConnectorClass.js)
