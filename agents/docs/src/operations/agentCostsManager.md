# AgentCostManager

The `AgentCostManager` class is responsible for managing and calculating the costs associated with agents in the system. It provides methods to retrieve the costs for a single agent as well as for an agent and its hierarchy.

## Properties

This class does not have any properties.

## Methods

| Name                | Parameters        | Return Type  | Description                                                                 |
|---------------------|-------------------|--------------|-----------------------------------------------------------------------------|
| `getAgentCosts`     | `agentId: number` | `Promise<AgentCost>` | Retrieves the costs for an agent and its hierarchy.                         |
| `getSingleAgentCosts` | `agentId: number` | `Promise<string>` | Retrieves the total cost for a single agent.                                |

### `getAgentCosts`

Retrieves the costs for an agent and its hierarchy.

#### Parameters

- `agentId: number`: The ID of the agent for which to retrieve the costs.

#### Returns

- `Promise<AgentCost>`: An object containing the costs for the agent and its hierarchy, as well as the total cost.

#### Example

```typescript
const agentCostManager = new AgentCostManager();
const agentCosts = await agentCostManager.getAgentCosts(1);
console.log(agentCosts);
```

### `getSingleAgentCosts`

Retrieves the total cost for a single agent.

#### Parameters

- `agentId: number`: The ID of the agent for which to retrieve the cost.

#### Returns

- `Promise<string>`: The total cost for the agent as a string.

#### Example

```typescript
const agentCostManager = new AgentCostManager();
const totalCost = await agentCostManager.getSingleAgentCosts(1);
console.log(totalCost);
```

## Example

```typescript
import { AgentCostManager } from '@policysynth/agents/operations/agentCostsManager.js';

const agentCostManager = new AgentCostManager();

// Get costs for an agent and its hierarchy
agentCostManager.getAgentCosts(1).then(agentCosts => {
  console.log('Agent Costs:', agentCosts);
}).catch(error => {
  console.error('Error:', error);
});

// Get total cost for a single agent
agentCostManager.getSingleAgentCosts(1).then(totalCost => {
  console.log('Total Cost:', totalCost);
}).catch(error => {
  console.error('Error:', error);
});
```

## Types

### `AgentCost`

An interface representing the structure of the agent cost data.

#### Properties

| Name        | Type   | Description                       |
|-------------|--------|-----------------------------------|
| `agentCosts` | `object` | An object containing the costs for each agent in the hierarchy. |
| `totalCost`  | `string` | The total cost for the agent and its hierarchy.                |