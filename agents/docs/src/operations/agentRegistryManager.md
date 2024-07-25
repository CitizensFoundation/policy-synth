# AgentRegistryManager

The `AgentRegistryManager` class is responsible for managing and retrieving active agent and connector classes from the agent registry.

## Methods

| Name                     | Parameters | Return Type                              | Description                                                                 |
|--------------------------|------------|------------------------------------------|-----------------------------------------------------------------------------|
| getActiveAgentClasses    | None       | Promise<PsAgentClassAttributes[]>        | Retrieves all active agent classes from the agent registry.                 |
| getActiveConnectorClasses| None       | Promise<PsAgentConnectorClassAttributes[]> | Retrieves all active connector classes from the agent registry.             |

## Example

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const manager = new AgentRegistryManager();

async function fetchActiveClasses() {
  try {
    const activeAgents = await manager.getActiveAgentClasses();
    console.log('Active Agents:', activeAgents);

    const activeConnectors = await manager.getActiveConnectorClasses();
    console.log('Active Connectors:', activeConnectors);
  } catch (error) {
    console.error('Error fetching active classes:', error);
  }
}

fetchActiveClasses();
```

## Detailed Method Descriptions

### getActiveAgentClasses

```typescript
async getActiveAgentClasses(): Promise<PsAgentClassAttributes[]>
```

Retrieves all active agent classes from the agent registry.

#### Returns
- `Promise<PsAgentClassAttributes[]>`: A promise that resolves to an array of active agent class attributes.

#### Throws
- `Error`: If the agent registry is not found.

### getActiveConnectorClasses

```typescript
async getActiveConnectorClasses(): Promise<PsAgentConnectorClassAttributes[]>
```

Retrieves all active connector classes from the agent registry.

#### Returns
- `Promise<PsAgentConnectorClassAttributes[]>`: A promise that resolves to an array of active connector class attributes.

#### Throws
- `Error`: If the agent registry is not found.