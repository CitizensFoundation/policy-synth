# AgentInputConnectors

Represents the many-to-many relationship between agents and their input connectors in the PolicySynth Agents system. Each record links a specific agent to a connector that serves as an input for that agent.

This model is mapped to the `AgentInputConnectors` table in the database and is used to associate agents (from the `ps_agents` table) with agent connectors (from the `ps_agent_connectors` table).

## Properties

| Name         | Type   | Description                                                                                 |
|--------------|--------|---------------------------------------------------------------------------------------------|
| agent_id     | number | The unique identifier of the agent. References the `id` field in the `ps_agents` table.     |
| connector_id | number | The unique identifier of the connector. References the `id` field in the `ps_agent_connectors` table. |

## Sequelize Model Options

- **Table Name:** `AgentInputConnectors`
- **Timestamps:** Disabled (`timestamps: false`)
- **Underscored:** Enabled (`underscored: true`)
- **Indexes:** Indexes on `agent_id` and `connector_id` for efficient querying.
- **Primary Key:** Composite primary key on (`agent_id`, `connector_id`)
- **Foreign Keys:**
  - `agent_id` references `ps_agents(id)` (on delete: CASCADE)
  - `connector_id` references `ps_agent_connectors(id)` (on delete: CASCADE)

## Example

```typescript
import { AgentInputConnectors } from '@policysynth/agents/dbModels/agentInputConnector.js';

// Associate an agent with a connector
await AgentInputConnectors.create({
  agent_id: 42,
  connector_id: 7,
});

// Query all connectors for a given agent
const connectors = await AgentInputConnectors.findAll({
  where: { agent_id: 42 }
});

// Remove an association (will cascade delete if agent or connector is deleted)
await AgentInputConnectors.destroy({
  where: { agent_id: 42, connector_id: 7 }
});
```

## Usage Notes

- This model is typically used internally by the PolicySynth Agents system to manage the connections between agents and their input connectors.
- Deleting an agent or connector will automatically remove the corresponding associations due to the `CASCADE` delete rule.
- The composite primary key ensures that each agent-connector pair is unique.