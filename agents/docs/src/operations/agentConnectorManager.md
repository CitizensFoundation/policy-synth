# AgentConnectorManager

The `AgentConnectorManager` class is responsible for managing agent connectors, including creating, updating, and associating connectors with agents. It provides methods to handle transactions and ensure the integrity of operations involving agents and connectors.

## Methods

| Name                           | Parameters                                                                                                                                                                                                 | Return Type             | Description                                                                 |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------------|
| `createConnector`              | `agentId: number, connectorClassId: number, userId: number, name: string, type: "input" \| "output"`                                                                                                       | `Promise<PsAgentConnector \| null>` | Creates a new connector for a specified agent and associates it as input or output. |
| `createYourPrioritiesGroupAndUpdateAgent` | `agent: PsAgent, agentClass: PsAgentClass, agentConnector: PsAgentConnector, type: "input" \| "output"`                                                                                               | `Promise<YpGroupData>`  | Creates a Your Priorities group and updates the agent with the new group information. |
| `getHeaders`                   | None                                                                                                                                                                                                      | `{ [key: string]: string }` | Retrieves headers for API requests, including an API key if available.     |
| `createGroup`                  | `currentGroupId: number, forAgentId: number, inputOutput: "input" \| "output", communityId: number, userId: number, name: string, description: string, structuredQuestions: any[]`                        | `Promise<any>`          | Creates a new group with specified parameters and returns the result.      |
| `updateConnectorConfiguration` | `connectorId: number, updatedConfig: Partial<PsAgentConnectorConfiguration>`                                                                                                                              | `Promise<void>`         | Updates the configuration of an existing connector.                        |
| `addExistingConnector`         | `groupId: number, agentId: number, connectorId: number, type: 'input' \| 'output'`                                                                                                                        | `Promise<void>`         | Adds an existing connector to an agent as either input or output.          |

## Example

```typescript
import { AgentConnectorManager } from '@policysynth/agents/operations/agentConnectorManager.js';

const manager = new AgentConnectorManager();

// Example usage: Creating a new connector
manager.createConnector(1, 2, 3, "New Connector", "input")
  .then(connector => console.log("Connector created:", connector))
  .catch(error => console.error("Error creating connector:", error));

// Example usage: Updating a connector configuration
manager.updateConnectorConfiguration(1, { name: "Updated Connector Name" })
  .then(() => console.log("Connector configuration updated"))
  .catch(error => console.error("Error updating connector configuration:", error));
```

### Detailed Method Descriptions

#### `createConnector`

Creates a new connector for a specified agent and associates it as either an input or output connector. It handles transactions to ensure data integrity and logs relevant information for debugging.

- **Parameters:**
  - `agentId`: The ID of the agent to which the connector will be associated.
  - `connectorClassId`: The ID of the connector class to be used.
  - `userId`: The ID of the user creating the connector.
  - `name`: The name of the connector.
  - `type`: Specifies whether the connector is an "input" or "output".

- **Returns:** A promise that resolves to the created `PsAgentConnector` or `null` if creation fails.

#### `createYourPrioritiesGroupAndUpdateAgent`

Creates a Your Priorities group and updates the agent with the new group information. It handles errors and logs them for debugging purposes.

- **Parameters:**
  - `agent`: The agent for which the group is being created.
  - `agentClass`: The class of the agent.
  - `agentConnector`: The connector associated with the agent.
  - `type`: Specifies whether the connector is an "input" or "output".

- **Returns:** A promise that resolves to the created `YpGroupData`.

#### `getHeaders`

Retrieves headers for API requests, including an API key if available.

- **Returns:** An object containing headers for API requests.

#### `createGroup`

Creates a new group with specified parameters and returns the result. It formats the data as `x-www-form-urlencoded` and sends a POST request to create the group.

- **Parameters:**
  - `currentGroupId`: The current group ID.
  - `forAgentId`: The ID of the agent for which the group is being created.
  - `inputOutput`: Specifies whether the group is for "input" or "output".
  - `communityId`: The ID of the community to which the group belongs.
  - `userId`: The ID of the user creating the group.
  - `name`: The name of the group.
  - `description`: The description of the group.
  - `structuredQuestions`: An array of structured questions for the group.

- **Returns:** A promise that resolves to the result of the group creation.

#### `updateConnectorConfiguration`

Updates the configuration of an existing connector by merging the updated configuration with the existing one.

- **Parameters:**
  - `connectorId`: The ID of the connector to be updated.
  - `updatedConfig`: A partial configuration object containing the updates.

- **Returns:** A promise that resolves when the update is complete.

#### `addExistingConnector`

Adds an existing connector to an agent as either input or output. It ensures that the connector belongs to the specified group and handles transactions to maintain data integrity.

- **Parameters:**
  - `groupId`: The ID of the group to which the connector belongs.
  - `agentId`: The ID of the agent to which the connector will be added.
  - `connectorId`: The ID of the connector to be added.
  - `type`: Specifies whether the connector is an "input" or "output".

- **Returns:** A promise that resolves when the connector is successfully added.