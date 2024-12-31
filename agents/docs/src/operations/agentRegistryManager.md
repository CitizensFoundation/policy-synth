# AgentRegistryManager

The `AgentRegistryManager` class is responsible for managing and retrieving active agent and connector classes from the database. It provides methods to fetch the latest versions of active agent and connector classes that are available to a specific user.

## Methods

| Name                      | Parameters        | Return Type                              | Description                                                                 |
|---------------------------|-------------------|------------------------------------------|-----------------------------------------------------------------------------|
| getActiveAgentClasses     | userId: number    | Promise<PsAgentClassAttributes[]>        | Retrieves the latest versions of active agent classes available to the user. |
| getActiveConnectorClasses | userId: number    | Promise<PsAgentConnectorClassAttributes[]> | Retrieves the latest versions of active connector classes available to the user. |

## Method Details

### getActiveAgentClasses

Retrieves the latest versions of active agent classes that are available to a specific user. The method filters the agent classes based on their availability and the user's access rights.

#### Parameters

- `userId` (number): The ID of the user for whom the active agent classes are being retrieved.

#### Returns

- `Promise<PsAgentClassAttributes[]>`: A promise that resolves to an array of the latest active agent class attributes available to the user.

#### Example

```typescript
const agentRegistryManager = new AgentRegistryManager();
const activeAgentClasses = await agentRegistryManager.getActiveAgentClasses(userId);
console.log(activeAgentClasses);
```

### getActiveConnectorClasses

Retrieves the latest versions of active connector classes that are available to a specific user. The method filters the connector classes based on their availability and the user's access rights.

#### Parameters

- `userId` (number): The ID of the user for whom the active connector classes are being retrieved.

#### Returns

- `Promise<PsAgentConnectorClassAttributes[]>`: A promise that resolves to an array of the latest active connector class attributes available to the user.

#### Example

```typescript
const agentRegistryManager = new AgentRegistryManager();
const activeConnectorClasses = await agentRegistryManager.getActiveConnectorClasses(userId);
console.log(activeConnectorClasses);
```

## Example Usage

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const agentRegistryManager = new AgentRegistryManager();
const userId = 123;

// Fetch active agent classes for the user
agentRegistryManager.getActiveAgentClasses(userId).then((activeAgentClasses) => {
  console.log('Active Agent Classes:', activeAgentClasses);
});

// Fetch active connector classes for the user
agentRegistryManager.getActiveConnectorClasses(userId).then((activeConnectorClasses) => {
  console.log('Active Connector Classes:', activeConnectorClasses);
});
```

This class utilizes Sequelize to interact with the database and retrieve the necessary data. It ensures that only the latest versions of the agent and connector classes are returned, based on the user's access rights and the availability of the classes.