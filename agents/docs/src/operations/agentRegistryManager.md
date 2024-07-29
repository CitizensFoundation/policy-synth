# AgentRegistryManager

The `AgentRegistryManager` class is responsible for managing and retrieving active agent and connector classes from the database. It provides methods to fetch active agent classes and active connector classes for a given user.

## Methods

### getActiveAgentClasses

Fetches the active agent classes for a given user. It filters the agents to keep only the latest version of each agent.

#### Parameters

| Name   | Type   | Description          |
|--------|--------|----------------------|
| userId | number | The ID of the user.  |

#### Return Type

`Promise<PsAgentClassAttributes[]>`

#### Description

Returns a promise that resolves to an array of active agent class attributes.

#### Example

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const manager = new AgentRegistryManager();
const userId = 1;

manager.getActiveAgentClasses(userId).then((agentClasses) => {
  console.log(agentClasses);
});
```

### getActiveConnectorClasses

Fetches the active connector classes for a given user. It filters the connectors to keep only the latest version of each connector.

#### Parameters

| Name   | Type   | Description          |
|--------|--------|----------------------|
| userId | number | The ID of the user.  |

#### Return Type

`Promise<PsAgentConnectorClassAttributes[]>`

#### Description

Returns a promise that resolves to an array of active connector class attributes.

#### Example

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const manager = new AgentRegistryManager();
const userId = 1;

manager.getActiveConnectorClasses(userId).then((connectorClasses) => {
  console.log(connectorClasses);
});
```

## Example Usage

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const manager = new AgentRegistryManager();
const userId = 1;

async function fetchAgentAndConnectorClasses() {
  const agentClasses = await manager.getActiveAgentClasses(userId);
  console.log('Active Agent Classes:', agentClasses);

  const connectorClasses = await manager.getActiveConnectorClasses(userId);
  console.log('Active Connector Classes:', connectorClasses);
}

fetchAgentAndConnectorClasses();
```

## Dependencies

The `AgentRegistryManager` class relies on the following imports:

```typescript
import {
  PsAgentRegistry,
  PsAgentClass,
  PsAgentConnectorClass,
  User,
} from "../dbModels/index.js";
import { literal, fn, col, Op, Sequelize } from "sequelize";
```

These imports include the necessary models and Sequelize functions used in the methods.