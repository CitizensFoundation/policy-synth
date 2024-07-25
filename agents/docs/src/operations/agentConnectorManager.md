# AgentConnectorManager

The `AgentConnectorManager` class is responsible for managing agent connectors, including creating new connectors and updating their configurations.

## Methods

### createConnector

Creates a new connector for a specified agent.

#### Parameters

| Name            | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| agentId         | number   | The ID of the agent to which the connector belongs. |
| connectorClassId| number   | The ID of the connector class.                   |
| name            | string   | The name of the connector.                       |
| type            | "input" \| "output" | The type of the connector (input or output). |

#### Returns

| Type                | Description                                      |
|---------------------|--------------------------------------------------|
| `Promise<PsAgentConnector \| null>` | The created connector or null if creation failed. |

#### Example

```typescript
const manager = new AgentConnectorManager();
const newConnector = await manager.createConnector(1, 2, "My Connector", "input");
console.log(newConnector);
```

### updateConnectorConfiguration

Updates the configuration of an existing connector.

#### Parameters

| Name            | Type                                      | Description                                      |
|-----------------|-------------------------------------------|--------------------------------------------------|
| connectorId     | number                                    | The ID of the connector to update.               |
| updatedConfig   | Partial<PsAgentConnectorConfiguration>    | The updated configuration values.                |

#### Returns

| Type                | Description                                      |
|---------------------|--------------------------------------------------|
| `Promise<void>`     | Resolves when the update is complete.            |

#### Example

```typescript
const manager = new AgentConnectorManager();
await manager.updateConnectorConfiguration(1, { name: "Updated Connector" });
```

## Example Usage

```typescript
import { AgentConnectorManager } from '@policysynth/agents/operations/agentConnectorManager.js';

const manager = new AgentConnectorManager();

// Create a new connector
manager.createConnector(1, 2, "My Connector", "input")
  .then(connector => console.log(connector))
  .catch(error => console.error(error));

// Update an existing connector's configuration
manager.updateConnectorConfiguration(1, { name: "Updated Connector" })
  .then(() => console.log("Connector updated"))
  .catch(error => console.error(error));
```

## Dependencies

- `sequelize`: Used for database transactions.
- `PsAgent`, `PsAgentConnector`, `PsAgentConnectorClass`: Database models used for managing agents and connectors.

## Notes

- The `createConnector` method includes a TODO comment to make the `user_id` dynamic.
- The `createConnector` method uses transactions to ensure atomicity.
- The `updateConnectorConfiguration` method merges the updated configuration with the existing one before saving.