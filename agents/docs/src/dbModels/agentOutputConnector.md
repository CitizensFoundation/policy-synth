# AgentOutputConnectors

Represents the many-to-many relationship between agents and their output connectors in the PolicySynth Agents system. This model links an agent to one or more output connectors, allowing agents to send data or results to various destinations.

**File:** `@policysynth/agents/dbModels/agentOutputConnector.js`

## Properties

| Name         | Type   | Description                                                                                 |
|--------------|--------|---------------------------------------------------------------------------------------------|
| agent_id     | number | The unique identifier of the agent. References the `id` field in the `ps_agents` table.     |
| connector_id | number | The unique identifier of the output connector. References the `id` field in `ps_agent_connectors`. |

## Sequelize Model Definition

- **Table Name:** `AgentOutputConnectors`
- **Primary Key:** Composite of `agent_id` and `connector_id`
- **Timestamps:** Disabled (`timestamps: false`)
- **Indexes:** Indexes on `agent_id` and `connector_id` for efficient querying.
- **Foreign Keys:**
  - `agent_id` references `ps_agents(id)` (on delete: CASCADE)
  - `connector_id` references `ps_agent_connectors(id)` (on delete: CASCADE)
- **Naming Convention:** Uses underscored field names in the database.

## Example

```typescript
import { AgentOutputConnectors } from '@policysynth/agents/dbModels/agentOutputConnector.js';

// Creating a new agent-output connector relationship
await AgentOutputConnectors.create({
  agent_id: 42,
  connector_id: 7,
});

// Querying all output connectors for a specific agent
const outputConnectors = await AgentOutputConnectors.findAll({
  where: { agent_id: 42 }
});

// Removing a connector from an agent (will cascade delete if agent or connector is deleted)
await AgentOutputConnectors.destroy({
  where: { agent_id: 42, connector_id: 7 }
});
```

## Usage Notes

- This model is typically used internally by the PolicySynth Agents system to manage the connections between agents and their output connectors.
- Deleting an agent or connector will automatically remove the corresponding entries in this table due to the `CASCADE` delete rule.
- The composite primary key ensures that each agent-connector pair is unique.

---

**See also:**  
- [`ps_agents`](./agent.js)  
- [`ps_agent_connectors`](./agentConnector.js)