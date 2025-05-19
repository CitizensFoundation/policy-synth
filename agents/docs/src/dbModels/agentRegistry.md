# PsAgentRegistry

Represents a registry of agent and connector classes in the PolicySynth Agents system. This model allows for the grouping and management of available agent and connector classes, supporting many-to-many relationships with both agents and connectors. It is stored in the `ps_agent_registries` table.

**File:** `@policysynth/agents/dbModels/agentRegistry.js`

## Properties

| Name         | Type                                   | Description                                                                                 |
|--------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| id           | number                                 | Primary key. Auto-incremented integer.                                                      |
| uuid         | string                                 | Universally unique identifier (UUID) for the registry.                                      |
| user_id      | number                                 | ID of the user who owns or created this registry.                                           |
| created_at   | Date                                   | Timestamp when the registry was created.                                                    |
| updated_at   | Date                                   | Timestamp when the registry was last updated.                                               |
| configuration| PsAgentRegistryConfiguration           | JSONB configuration object for the registry (e.g., supported agents, metadata, etc.).       |
| Agents       | PsAgentClassAttributes[] (optional)    | Array of associated agent classes (many-to-many).                                           |
| Connectors   | PsAgentConnectorClassAttributes[] (optional) | Array of associated connector classes (many-to-many).                                  |

## Methods

| Name             | Parameters                                 | Return Type         | Description                                                                                 |
|------------------|--------------------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| addAgent         | agent: PsAgentClass                        | Promise<void>       | Adds an agent class to the registry.                                                        |
| addConnector     | connector: PsAgentConnectorClass           | Promise<void>       | Adds a connector class to the registry.                                                     |
| removeAgent      | agent: PsAgentClass                        | Promise<void>       | Removes an agent class from the registry.                                                   |
| removeConnector  | connector: PsAgentConnectorClass           | Promise<void>       | Removes a connector class from the registry.                                                |

## Sequelize Model Initialization

- **Table Name:** `ps_agent_registries`
- **Indexes:** Unique on `uuid`, index on `user_id`
- **Timestamps:** Enabled (`created_at`, `updated_at`)
- **Associations:**
  - `Agents`: Many-to-many with `PsAgentClass` via `AgentRegistryAgents` join table.
  - `Connectors`: Many-to-many with `PsAgentConnectorClass` via `AgentRegistryConnectors` join table.

## Example

```typescript
import { PsAgentRegistry } from '@policysynth/agents/dbModels/agentRegistry.js';
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { PsAgentConnectorClass } from '@policysynth/agents/dbModels/agentConnectorClass.js';

// Create a new agent registry
const registry = await PsAgentRegistry.create({
  user_id: 1,
  configuration: {
    supportedAgents: [],
  },
});

// Add an agent class to the registry
const agentClass = await PsAgentClass.findByPk(1);
await registry.addAgent(agentClass);

// Add a connector class to the registry
const connectorClass = await PsAgentConnectorClass.findByPk(1);
await registry.addConnector(connectorClass);

// Remove an agent class from the registry
await registry.removeAgent(agentClass);

// Remove a connector class from the registry
await registry.removeConnector(connectorClass);

// Access associated agents and connectors
const agents = await registry.getAgents();
const connectors = await registry.getConnectors();
```

---

**Note:**  
- The `configuration` property is a flexible JSONB object, typically containing metadata such as supported agents and connectors.
- Associations are managed via join tables (`AgentRegistryAgents` and `AgentRegistryConnectors`), allowing for efficient many-to-many relationships.
- The model uses Sequelize's `timestamps` and `underscored` options for consistent database field naming and auditing.