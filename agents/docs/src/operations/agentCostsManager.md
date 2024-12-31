# AgentCostManager

The `AgentCostManager` class is responsible for managing and calculating the costs associated with agents in the system. It provides methods to retrieve detailed costs, aggregate costs for an agent and its hierarchy, and costs for a single agent.

## Methods

| Name                  | Parameters        | Return Type                        | Description                                                                 |
|-----------------------|-------------------|------------------------------------|-----------------------------------------------------------------------------|
| getDetailedAgentCosts | agentId: number   | Promise<PsDetailedAgentCostResults[]> | Retrieves detailed cost information for a specific agent, including token usage and costs. |
| getAgentCosts         | agentId: number   | Promise<PsAgentCostResults>        | Calculates the total costs for an agent and its hierarchy, returning a summary of costs. |
| getSingleAgentCosts   | agentId: number   | Promise<string>                    | Retrieves the total cost for a single agent, without considering its hierarchy. |

## Example

```typescript
import { AgentCostManager } from '@policysynth/agents/operations/agentCostsManager.js';

const agentCostManager = new AgentCostManager();

// Example usage to get detailed costs for an agent
agentCostManager.getDetailedAgentCosts(1).then(detailedCosts => {
  console.log(detailedCosts);
}).catch(error => {
  console.error("Error fetching detailed agent costs:", error);
});

// Example usage to get aggregated costs for an agent and its hierarchy
agentCostManager.getAgentCosts(1).then(agentCosts => {
  console.log(agentCosts);
}).catch(error => {
  console.error("Error fetching agent costs:", error);
});

// Example usage to get costs for a single agent
agentCostManager.getSingleAgentCosts(1).then(totalCost => {
  console.log("Total cost for single agent:", totalCost);
}).catch(error => {
  console.error("Error fetching single agent costs:", error);
});
```

### Method Details

#### getDetailedAgentCosts

- **Parameters**: `agentId` - The ID of the agent for which to retrieve detailed cost information.
- **Returns**: A promise that resolves to an array of `PsDetailedAgentCostResults`, which includes detailed cost information such as token usage and costs for each AI model associated with the agent.

#### getAgentCosts

- **Parameters**: `agentId` - The ID of the agent for which to calculate costs.
- **Returns**: A promise that resolves to a `PsAgentCostResults` object, which includes the total costs for the agent and its hierarchy, broken down by agent level.

#### getSingleAgentCosts

- **Parameters**: `agentId` - The ID of the agent for which to retrieve the total cost.
- **Returns**: A promise that resolves to a string representing the total cost for the specified agent, without considering its hierarchy.