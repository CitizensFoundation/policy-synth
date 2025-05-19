# AgentRegistryConnectors

Represents the join table between agent registries and agent connector classes in the PolicySynth Agents system. This model is used to associate a given agent registry with one or more agent connector classes, enabling dynamic registration and management of available connectors for each registry.

**File:** `@policysynth/agents/dbModels/agentRegistryConnector.js`

## Properties

| Name                        | Type    | Description                                                                                 |
|-----------------------------|---------|---------------------------------------------------------------------------------------------|
| id                          | number  | Primary key. Auto-incremented unique identifier for the record.                             |
| ps_agent_registry_id        | number  | Foreign key referencing the `ps_agent_registries` table. Identifies the agent registry.     |
| ps_agent_connector_class_id | number  | Foreign key referencing the `ps_agent_connector_classes` table. Identifies the connector.   |
| created_at                  | Date    | Timestamp for when the record was created.                                                  |
| updated_at                  | Date    | Timestamp for when the record was last updated.                                             |

## Sequelize Model Options

- **Table Name:** `AgentRegistryConnectors`
- **Timestamps:** Enabled (`created_at`, `updated_at`)
- **Underscored:** Enabled (snake_case column names)
- **Indexes:** 
  - On `ps_agent_registry_id`
  - On `ps_agent_connector_class_id`
- **Foreign Keys:**
  - `ps_agent_registry_id` references `ps_agent_registries(id)` (CASCADE on delete)
  - `ps_agent_connector_class_id` references `ps_agent_connector_classes(id)` (CASCADE on delete)

## Example

```typescript
import { AgentRegistryConnectors } from '@policysynth/agents/dbModels/agentRegistryConnector.js';

// Creating a new association between a registry and a connector class
const association = await AgentRegistryConnectors.create({
  ps_agent_registry_id: 1,
  ps_agent_connector_class_id: 2,
});

// Querying all connectors for a given registry
const connectors = await AgentRegistryConnectors.findAll({
  where: { ps_agent_registry_id: 1 }
});

// Removing an association (will cascade on delete if registry or connector is deleted)
await association.destroy();
```

## Usage Notes

- This model is typically not used directly by end-users, but rather by internal logic that manages agent registries and their available connectors.
- Deleting a registry or connector class will automatically remove associated records in this table due to the `CASCADE` delete rule.
- The model is initialized with Sequelize and supports all standard Sequelize model operations (create, find, update, destroy, etc.).

---

**See also:**
- [`PsAgentRegistryAttributes`](#) (agent registry model)
- [`PsAgentConnectorClassAttributes`](#) (agent connector class model)