# AgentRegistryAgents

Represents the association between an Agent Registry and an Agent Class in the PolicySynth Agents system. This model is used to link agent registries (collections of available agent classes) with specific agent classes, supporting many-to-many relationships.

## Properties

| Name                  | Type     | Description                                                                                 |
|-----------------------|----------|---------------------------------------------------------------------------------------------|
| id                    | number   | Primary key. Auto-incremented unique identifier for the association.                        |
| ps_agent_registry_id  | number   | Foreign key referencing the `ps_agent_registries` table. Identifies the agent registry.     |
| ps_agent_class_id     | number   | Foreign key referencing the `ps_agent_classes` table. Identifies the agent class.           |
| created_at            | Date     | Timestamp when the association was created.                                                 |
| updated_at            | Date     | Timestamp when the association was last updated.                                            |

## Sequelize Model Options

- **tableName**: `"AgentRegistryAgents"`
- **timestamps**: `true` (automatically manages `created_at` and `updated_at`)
- **underscored**: `true` (uses snake_case for DB columns)
- **indexes**:
  - Index on `ps_agent_registry_id`
  - Index on `ps_agent_class_id`

## Example

```typescript
import { AgentRegistryAgents } from '@policysynth/agents/dbModels/agentRegistryAgent.js';

// Creating a new association between a registry and an agent class
const association = await AgentRegistryAgents.create({
  ps_agent_registry_id: 1,
  ps_agent_class_id: 42,
});

// Querying associations for a specific registry
const agentClassLinks = await AgentRegistryAgents.findAll({
  where: { ps_agent_registry_id: 1 }
});

// Accessing properties
console.log(association.id); // e.g., 10
console.log(association.ps_agent_registry_id); // 1
console.log(association.ps_agent_class_id); // 42
console.log(association.created_at); // Date instance
console.log(association.updated_at); // Date instance
```

## Notes

- This model is typically used internally by Sequelize to manage many-to-many relationships between agent registries and agent classes.
- Foreign key constraints are enforced with `onDelete: "CASCADE"`, so deleting a registry or agent class will remove the association.
- The model does not define explicit associations in this file, but can be associated in the main model index or via `.associate()` methods elsewhere.