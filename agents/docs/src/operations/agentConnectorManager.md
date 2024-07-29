# AgentConnectorManager

The `AgentConnectorManager` class is responsible for managing the creation and configuration of agent connectors. It interacts with the database models and external services to create and update connectors for agents.

## Methods

### createConnector

Creates a new connector for a specified agent.

#### Parameters

| Name             | Type                                      | Description                                      |
|------------------|-------------------------------------------|--------------------------------------------------|
| agentId          | `number`                                  | The ID of the agent for which the connector is created. |
| connectorClassId | `number`                                  | The ID of the connector class.                   |
| userId           | `number`                                  | The ID of the user creating the connector.       |
| name             | `string`                                  | The name of the connector.                       |
| type             | `"input" \| "output"`                     | The type of the connector (input or output).     |

#### Returns

| Type                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `Promise<PsAgentConnector \| null>` | The created connector or null if creation failed. |

#### Example

```typescript
const manager = new AgentConnectorManager();
const connector = await manager.createConnector(1, 2, 3, "My Connector", "input");
```

### createYourPrioritiesGroupAndUpdateAgent

Creates a Your Priorities group and updates the agent with the new group information.

#### Parameters

| Name           | Type                | Description                                      |
|----------------|---------------------|--------------------------------------------------|
| agent          | `PsAgent`           | The agent for which the group is created.        |
| agentClass     | `PsAgentClass`      | The class of the agent.                          |
| agentConnector | `PsAgentConnector`  | The connector associated with the agent.         |

#### Returns

| Type                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `Promise<YpGroupData>` | The created group data.                         |

#### Example

```typescript
const group = await manager.createYourPrioritiesGroupAndUpdateAgent(agent, agentClass, agentConnector);
```

### getHeaders

Gets the headers required for API requests.

#### Returns

| Type                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `{ [key: string]: string }` | The headers for API requests.               |

#### Example

```typescript
const headers = manager.getHeaders();
```

### createGroup

Creates a new group with the specified parameters.

#### Parameters

| Name               | Type                | Description                                      |
|--------------------|---------------------|--------------------------------------------------|
| currentGroupId     | `number`            | The ID of the current group.                     |
| communityId        | `number`            | The ID of the community.                         |
| userId             | `number`            | The ID of the user creating the group.           |
| name               | `string`            | The name of the group.                           |
| description        | `string`            | The description of the group.                    |
| structuredQuestions| `any[]`             | The structured questions for the group.          |

#### Returns

| Type                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `Promise<YpGroupData>` | The created group data.                         |

#### Example

```typescript
const group = await manager.createGroup(1, 2, 3, "Group Name", "Group Description", []);
```

### updateConnectorConfiguration

Updates the configuration of a specified connector.

#### Parameters

| Name           | Type                                      | Description                                      |
|----------------|-------------------------------------------|--------------------------------------------------|
| connectorId    | `number`                                  | The ID of the connector to update.               |
| updatedConfig  | `Partial<PsAgentConnectorConfiguration>`  | The updated configuration.                       |

#### Returns

| Type                  | Description                                      |
|-----------------------|--------------------------------------------------|
| `Promise<void>`       | Resolves when the update is complete.            |

#### Example

```typescript
await manager.updateConnectorConfiguration(1, { name: "Updated Connector" });
```

## Example Usage

```typescript
import { AgentConnectorManager } from '@policysynth/agents/operations/agentConnectorManager.js';

const manager = new AgentConnectorManager();

// Create a new connector
const connector = await manager.createConnector(1, 2, 3, "My Connector", "input");

// Update connector configuration
await manager.updateConnectorConfiguration(connector.id, { name: "Updated Connector" });
```

This documentation provides a detailed overview of the `AgentConnectorManager` class, its methods, parameters, return types, and example usage.