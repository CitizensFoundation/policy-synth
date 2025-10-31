# AgentConnectorManager

The `AgentConnectorManager` class provides management operations for agent connectors within the PolicySynth Agents framework. It extends `PolicySynthAgentBase` and is responsible for creating, updating, and associating connectors with agents, as well as handling special logic for Your Priorities connectors and group creation.

## Properties

This class does not define its own properties, but inherits from `PolicySynthAgentBase`, which may provide logging and utility methods.

## Methods

| Name                                   | Parameters                                                                                                                                                                                                                                    | Return Type                       | Description                                                                                                 |
|---------------------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `createConnector`                      | `agentId: number, connectorClassId: number, userId: number, name: string, type: "input" \| "output"`                                                                                                                                        | `Promise<PsAgentConnector \| null>` | Creates a new connector for a given agent and associates it as input or output. Handles Your Priorities logic. |
| `createYourPrioritiesGroupAndUpdateAgent` | `agent: PsAgent, agentClass: PsAgentClass, agentConnector: PsAgentConnector, type: "input" \| "output"`                                                                                                                                    | `Promise<YpGroupData>`             | Creates a Your Priorities group and updates the connector configuration with the new group ID.                |
| `getHeaders`                           | None                                                                                                                                                                                                                                          | `{ [key: string]: string }`        | Returns headers for API requests, including an API key if available in environment variables.                 |
| `createGroup`                          | `currentGroupId: number, forAgentId: number, inputOutput: "input" \| "output", communityId: number, userId: number, name: string, description: string, structuredQuestions: any[]`                                                          | `Promise<any>`                     | Creates a new group via an external API, using form-urlencoded data.                                         |
| `updateConnectorConfiguration`         | `connectorId: number, updatedConfig: Partial<PsAgentConnectorConfiguration>`                                                                                                                          | `Promise<void>`                    | Updates the configuration of an existing connector.                                                          |
| `addExistingConnector`                 | `groupId: number, agentId: number, connectorId: number, type: "input" \| "output"`                                                                                                                    | `Promise<void>`                    | Associates an existing connector with an agent as input or output, ensuring group ownership.                  |

---

### Method Details

#### createConnector

Creates a new connector for a specified agent, using a given connector class and user. Handles both input and output connectors, and includes special logic for Your Priorities connectors (auto-creating a group and updating configuration if needed).

- **Parameters:**
  - `agentId`: The ID of the agent to attach the connector to.
  - `connectorClassId`: The ID of the connector class to use.
  - `userId`: The ID of the user performing the operation.
  - `name`: The name for the new connector.
  - `type`: `"input"` or `"output"`; determines the connector's direction.
- **Returns:** The created `PsAgentConnector` instance (with included class and agent associations), or `null` if creation failed.

#### createYourPrioritiesGroupAndUpdateAgent

Handles the creation of a Your Priorities group for an agent and updates the connector's configuration with the new group ID.

- **Parameters:**
  - `agent`: The agent instance.
  - `agentClass`: The agent class instance.
  - `agentConnector`: The connector instance to update.
  - `type`: `"input"` or `"output"`.
- **Returns:** The created `YpGroupData` object.

#### getHeaders

Returns HTTP headers for API requests, including an API key if set in environment variables.

- **Returns:** An object with header key-value pairs.

#### createGroup

Creates a new group by sending a POST request to an external API endpoint, using form-urlencoded data.

- **Parameters:**
  - `currentGroupId`: The current group ID (for context).
  - `forAgentId`: The agent ID for which the group is being created.
  - `inputOutput`: `"input"` or `"output"`.
  - `communityId`: The community ID to associate the group with.
  - `userId`: The user ID performing the operation.
  - `name`: The name of the group.
  - `description`: The description of the group.
  - `structuredQuestions`: An array of structured questions for the group.
- **Returns:** The created group data as returned by the API.

#### updateConnectorConfiguration

Updates the configuration of an existing connector by merging the provided configuration with the current one.

- **Parameters:**
  - `connectorId`: The ID of the connector to update.
  - `updatedConfig`: Partial configuration to merge.
- **Returns:** `void`

#### addExistingConnector

Associates an existing connector with an agent as either input or output, ensuring the connector belongs to the specified group.

- **Parameters:**
  - `groupId`: The group ID the connector must belong to.
  - `agentId`: The agent ID to associate with.
  - `connectorId`: The connector ID to associate.
  - `type`: `"input"` or `"output"`.
- **Returns:** `void`

---

## Example

```typescript
import { AgentConnectorManager } from '@policysynth/agents/operations/agentConnectorManager.js';

// Example: Creating a new output connector for an agent
const manager = new AgentConnectorManager();

const newConnector = await manager.createConnector(
  123, // agentId
  456, // connectorClassId
  789, // userId
  "My Output Connector",
  "output"
);

if (newConnector) {
  console.log("Connector created:", newConnector.id);
}

// Example: Updating connector configuration
await manager.updateConnectorConfiguration(newConnector.id, {
  name: "Updated Connector Name",
  permissionNeeded: "admin"
});

// Example: Adding an existing connector as input to an agent
await manager.addExistingConnector(
  101, // groupId
  123, // agentId
  202, // connectorId
  "input"
);
```

---

**Note:**  
- This class relies on several environment variables for API keys and server paths.
- It uses Sequelize transactions for atomic operations.
- The Your Priorities connector logic is currently somewhat hardcoded and may require refactoring for modularity.
- All returned and accepted types (such as `PsAgent`, `PsAgentConnector`, `YpGroupData`, etc.) are defined in the project type definitions.