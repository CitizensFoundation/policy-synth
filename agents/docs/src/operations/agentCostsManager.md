# AgentCostManager

The `AgentCostManager` class provides methods to calculate and retrieve detailed cost breakdowns for AI agent usage within the PolicySynth platform. It aggregates model usage statistics, applies pricing configurations, and computes costs for individual agents and agent hierarchies.

This class extends `PolicySynthAgentBase` and interacts with the database using Sequelize to fetch usage and pricing data.

---

## Properties

| Name | Type | Description |
|------|------|-------------|
| *(inherited)* | | Inherits all properties from `PolicySynthAgentBase`. |

---

## Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| `getDetailedAgentCosts` | `agentId: number` | `Promise<PsDetailedAgentCostResults[]>` | Returns a detailed breakdown of costs for the specified agent and all its sub-agents, including token usage and cost components. |
| `getAgentCosts` | `agentId: number` | `Promise<PsAgentCostResults>` | Returns a summary of costs for the specified agent and its sub-agents, grouped by agent and hierarchy level. |
| `getSingleAgentCosts` | `agentId: number` | `Promise<string>` | Returns the total cost (as a string) for a single agent (not including sub-agents). |
| `getSubAgentIds` *(private)* | `rootId: number` | `Promise<number[]>` | Recursively retrieves all sub-agent IDs for a given root agent. |
| `calcCosts` *(private)* | `mu: PsModelUsageAttributes, prices: PsBaseModelPriceConfiguration` | `PsCostBreakdown` | Calculates the cost breakdown for a given model usage and price configuration. |

---

## Type Definitions

### PsCostBreakdown

```typescript
interface PsCostBreakdown {
  costInNormal: number;
  costInCached: number;
  costInLong: number;
  costOutNormal: number;
  costInCachedLong: number;
  costOutLong: number;
  totalCost: number;
}
```
*Represents the breakdown of costs for a single model usage record.*

---

## Example

```typescript
import { AgentCostManager } from '@policysynth/agents/operations/agentCostsManager.js';

const agentCostManager = new AgentCostManager();

// Get detailed cost breakdown for an agent and its sub-agents
const detailedCosts = await agentCostManager.getDetailedAgentCosts(42);
console.log(detailedCosts);

// Get summarized costs for an agent hierarchy
const summary = await agentCostManager.getAgentCosts(42);
console.log(summary);

// Get total cost for a single agent (excluding sub-agents)
const singleCost = await agentCostManager.getSingleAgentCosts(42);
console.log(`Total cost: $${singleCost}`);
```

---

## Method Details

### getDetailedAgentCosts

**Signature:**  
`public async getDetailedAgentCosts(agentId: number): Promise<PsDetailedAgentCostResults[]>`

- Returns an array of detailed cost records for the specified agent and all its sub-agents.
- Each record includes token usage, cost breakdowns, agent/model names, and timestamps.

---

### getAgentCosts

**Signature:**  
`public async getAgentCosts(agentId: number): Promise<PsAgentCostResults>`

- Returns a summary object with an array of agent costs (including hierarchy level) and the total cost for the agent and all sub-agents.

---

### getSingleAgentCosts

**Signature:**  
`public async getSingleAgentCosts(agentId: number): Promise<string>`

- Returns the total cost as a string for a single agent (does not include sub-agents).

---

### getSubAgentIds (private)

**Signature:**  
`private async getSubAgentIds(rootId: number): Promise<number[]>`

- Recursively finds all sub-agent IDs for a given root agent, including the root itself.

---

### calcCosts (private)

**Signature:**  
`private calcCosts(mu: PsModelUsageAttributes, prices: PsBaseModelPriceConfiguration): PsCostBreakdown`

- Calculates the cost breakdown for a single model usage record using the provided price configuration.

---

## Notes

- All cost calculations are based on token usage and the corresponding price configuration for each AI model.
- The class is designed to work with a hierarchical agent structure, supporting recursive cost aggregation.
- Error handling is included; errors are logged and rethrown with descriptive messages.

---

## See Also

- `PsModelUsageAttributes`
- `PsBaseModelPriceConfiguration`
- `PsDetailedAgentCostResults`
- `PsAgentCostResults`
- `PolicySynthAgentBase` (base class)

---

**File:** `@policysynth/agents/operations/agentCostsManager.js`