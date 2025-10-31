# PsAgentConnector

Represents an AI agent connector instance in the PolicySynth Agents system. Connectors are used to link agents to external systems or to each other, enabling data flow and integration between different components of an agent workflow. This model is mapped to the `ps_agent_connectors` table in the database.

## Properties

| Name           | Type                                   | Description                                                                                 |
|----------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| id             | number                                 | Primary key. Auto-incremented unique identifier.                                            |
| uuid           | string                                 | Universally unique identifier (UUID v4) for the connector.                                  |
| user_id        | number                                 | Foreign key referencing the user who owns/created the connector.                            |
| created_at     | Date                                   | Timestamp when the connector was created.                                                   |
| updated_at     | Date                                   | Timestamp when the connector was last updated.                                              |
| class_id       | number                                 | Foreign key referencing the connector class definition (`PsAgentConnectorClass`).            |
| group_id       | number                                 | Foreign key referencing the group this connector belongs to.                                |
| configuration  | PsAgentConnectorsBaseConfiguration     | JSONB configuration object containing connector-specific settings and metadata.              |
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
- **belongsToMany** `PsAgent` as `InputAgents` (through `AgentInputConnectors`)
- **belongsToMany** `PsAgent` as `OutputAgents` (through `AgentOutputConnectors`)

## Example

```typescript
import { PsAgentConnector } from '@policysynth/agents/dbModels/agentConnector.js';

// Creating a new agent connector
const connector = await PsAgentConnector.create({
  user_id: 1,
  class_id: 2,
  group_id: 3,
  configuration: {
    name: "My Discord Connector",
    permissionNeeded: "readWrite",
    // ...other connector-specific config
  }
});

// Fetching a connector with associations
const loadedConnector = await PsAgentConnector.findOne({
  where: { uuid: "some-uuid" },
  include: [
    { association: "Class" },
    { association: "User" },
    { association: "Group" },
    { association: "InputAgents" },
    { association: "OutputAgents" }
  ]
});

console.log(loadedConnector?.configuration.name); // "My Discord Connector"
```

## Notes

- The `configuration` property is a flexible JSONB object and its structure depends on the connector class.
- Input and output agent associations allow connectors to be flexibly wired into agent graphs.
- This model is central to the PolicySynth agent orchestration and integration system.