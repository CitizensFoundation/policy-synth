# PsBaseAgentRunner

An abstract base class for managing the lifecycle of PolicySynth agents and connectors, including registration, setup, and graceful shutdown. This class is designed to be extended for specific agent runner implementations. It handles agent and connector class creation, registration with the agent registry, and orchestrates the setup and running of agent queues.

**File:** `@policysynth/agents/base/agentRunner.js`

---

## Properties

| Name                      | Type                                                        | Description                                                                                   |
|---------------------------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| agentsToRun               | `PolicySynthAgentQueue[]`                                   | List of agent queues to be run and managed.                                                   |
| agentRegistry             | `PsAgentRegistry \| null`                                   | The agent registry instance used for registering agents and connectors.                       |
| registeredAgentClasses    | `PsAgentClass[]`                                            | List of agent classes that have been registered.                                              |
| registeredConnectorClasses| `PsAgentConnectorClass[]`                                   | List of connector classes that have been registered.                                          |
| agentClasses              | `PsAgentClassCreationAttributes[]` (abstract)               | List of agent class definitions to be managed (must be defined by subclass).                  |
| connectorClasses          | `PsAgentConnectorClassCreationAttributes[]` (abstract)      | List of connector class definitions to be managed (must be defined by subclass).              |

---

## Methods

| Name                        | Parameters                                                                 | Return Type                | Description                                                                                                 |
|-----------------------------|----------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| constructor                 | -                                                                          | -                          | Initializes the runner and checks for required environment variables.                                        |
| setupAgents (abstract)      | -                                                                          | `Promise<void>`            | Abstract method to be implemented by subclasses for custom agent setup logic.                               |
| setupAndRunAgents           | -                                                                          | `Promise<void>`            | Connects to the database, initializes models, sets up agent/connector classes, and starts agent queues.     |
| inspectDynamicMethods       | `obj: any, className: string`                                              | `void`                     | Logs all methods (including dynamically added) of a given object for debugging purposes.                    |
| registerAgent               | `agentQueue: PolicySynthAgentQueue`                                        | `Promise<void>`            | Registers an agent class with the agent registry and tracks it as registered.                               |
| registerConnectors          | -                                                                          | `Promise<void>`            | Registers all connector classes with the agent registry and tracks them as registered.                      |
| getOrCreateAgentRegistry    | -                                                                          | `Promise<PsAgentRegistry>` | Retrieves or creates the agent registry in the database.                                                    |
| createAgentClassesIfNeeded  | -                                                                          | `Promise<void>`            | Ensures all agent classes in `agentClasses` exist in the database, creating them if necessary.              |
| createConnectorClassesIfNeeded | -                                                                       | `Promise<void>`            | Ensures all connector classes in `connectorClasses` exist in the database, creating them if necessary.      |
| run                        | -                                                                           | `Promise<void>`            | Main entry point: sets up graceful shutdown and starts the agent setup and run process.                     |
| setupGracefulShutdown       | -                                                                           | `void`                     | Sets up handlers for SIGTERM and SIGINT to gracefully pause agents and unregister them if needed.           |

---

## Example

```typescript
import { PsBaseAgentRunner } from '@policysynth/agents/base/agentRunner.js';
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';
import { PsAgentClassCreationAttributes, PsAgentConnectorClassCreationAttributes } from '@policysynth/agents/base/agentRunner.js';

// Example subclass implementing the abstract PsBaseAgentRunner
class MyAgentRunner extends PsBaseAgentRunner {
  protected agentClasses: PsAgentClassCreationAttributes[] = [
    {
      class_base_id: "smarter_crowdsourcing",
      name: "Smarter Crowdsourcing Agent",
      version: 1,
      configuration: {
        category: "research",
        subCategory: "crowdsourcing",
        description: "An agent for running the Smarter Crowdsourcing process",
        queueName: "smarter_crowdsourcing_queue",
        imageUrl: "https://example.com/image.png",
        iconName: "smarter_crowdsourcing",
        capabilities: ["research", "analysis"],
        questions: [],
        supportedConnectors: [],
        hasPublicAccess: true,
      },
      available: true,
    }
  ];

  protected connectorClasses: PsAgentConnectorClassCreationAttributes[] = [
    {
      class_base_id: "google_docs_connector",
      name: "Google Docs",
      version: 1,
      available: true,
      configuration: {
        name: "Google Docs",
        classType: "docs",
        description: "Connector for Google Docs",
        imageUrl: "https://example.com/docs.png",
        iconName: "docs",
        questions: [],
        hasPublicAccess: true,
      },
      created_at: new Date(),
      updated_at: new Date(),
    }
  ];

  async setupAgents() {
    // Instantiate and add your agent queues to this.agentsToRun
    const myQueue = new PolicySynthAgentQueue(/* ...args */);
    this.agentsToRun.push(myQueue);
  }
}

// Usage
const runner = new MyAgentRunner();
runner.run();
```

---

## Notes

- **Subclassing:** You must extend `PsBaseAgentRunner` and implement the `setupAgents()` method, as well as provide the `agentClasses` and `connectorClasses` arrays.
- **Graceful Shutdown:** The runner will handle SIGTERM and SIGINT signals to pause all agent queues and optionally unregister agents/connectors.
- **Environment Variable:** The environment variable `YP_USER_ID_FOR_AGENT_CREATION` must be set for agent/connector creation.
- **Database Integration:** This class expects Sequelize models for agents, connectors, and registries to be available and initialized.

---

## Related Types

- `PsAgentClassCreationAttributes`
- `PsAgentConnectorClassCreationAttributes`
- `PolicySynthAgentQueue`
- `PsAgentRegistry`
- `PsAgentClass`
- `PsAgentConnectorClass`

---

This class provides a robust foundation for orchestrating PolicySynth agent and connector lifecycles in a scalable, maintainable, and production-ready manner.