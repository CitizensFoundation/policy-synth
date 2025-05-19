# PsAgentConnector

Represents an Agent Connector instance in the PolicySynth Agents system. An Agent Connector is a configurable, reusable component that connects agents to external systems or other agents, enabling data flow and integration. This model is mapped to the `ps_agent_connectors` table in the database.

## Properties

| Name           | Type                                   | Description                                                                                 |
|----------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| id             | number                                 | Primary key. Auto-incremented integer ID.                                                   |
| uuid           | string                                 | Universally unique identifier for the connector.                                            |
| user_id        | number                                 | ID of the user who created or owns this connector.                                          |
| created_at     | Date                                   | Timestamp when the connector was created.                                                   |
| updated_at     | Date                                   | Timestamp when the connector was last updated.                                              |
| class_id       | number                                 | Foreign key referencing the connector class definition (`PsAgentConnectorClass`).           |
| group_id       | number                                 | Foreign key referencing the group this connector belongs to.                                |
| configuration  | PsAgentConnectorsBaseConfiguration     | JSON configuration object for the connector instance.                                       |
| User           | YpUserData (optional)                  | Associated user object (if loaded via association).                                         |
| Group          | YpGroupData (optional)                 | Associated group object (if loaded via association).                                        |
| Class          | PsAgentConnectorClassAttributes (optional) | Associated connector class definition (if loaded via association).                      |
| InputAgents    | PsAgentAttributes[] (optional)         | Agents that use this connector as an input (many-to-many association).                      |
| OutputAgents   | PsAgentAttributes[] (optional)         | Agents that use this connector as an output (many-to-many association).                     |

## Sequelize Model Definition

- **Table Name:** `ps_agent_connectors`
- **Indexes:** `uuid` (unique), `user_id`, `class_id`, `group_id`
- **Timestamps:** `created_at`, `updated_at`
- **Underscored:** true (snake_case columns)

## Associations

- **belongsTo** `PsAgentConnectorClass` as `Class` (via `class_id`)
- **belongsTo** `User` as `User` (via `user_id`)
- **belongsTo** `Group` as `Group` (via `group_id`)
- **hasMany** `PsExternalApiUsage` as `ExternalApiUsage` (via `connector_id`)
- **hasMany** `PsModelUsage` as `ModelUsage` (via `connector_id`)
- **belongsToMany** `PsAgent` as `InputAgents` (through `AgentInputConnectors`, via `connector_id`)
- **belongsToMany** `PsAgent` as `OutputAgents` (through `AgentOutputConnectors`, via `connector_id`)

## Example

```typescript
import { PsAgentConnector } from '@policysynth/agents/dbModels/agentConnector.js';

// Creating a new agent connector instance
const connector = await PsAgentConnector.create({
  user_id: 1,
  class_id: 2,
  group_id: 3,
  configuration: {
    name: "My Discord Connector",
    permissionNeeded: "readWrite",
    // ...other configuration fields
  }
});

// Fetching with associations
const loadedConnector = await PsAgentConnector.findByPk(1, {
  include: [
    { association: 'Class' },
    { association: 'User' },
    { association: 'Group' },
    { association: 'InputAgents' },
    { association: 'OutputAgents' }
  ]
});

console.log(loadedConnector.Class?.configuration.description);
```

## Notes

- The `configuration` property is a flexible JSON object defined by the connector class and may include fields such as `name`, `permissionNeeded`, and other connector-specific settings.
- The `InputAgents` and `OutputAgents` associations allow connectors to be linked to multiple agents, supporting complex agent workflows.
- This model is intended to be used as part of the PolicySynth Agents orchestration and integration system.

---

**File:** `@policysynth/agents/dbModels/agentConnector.js`