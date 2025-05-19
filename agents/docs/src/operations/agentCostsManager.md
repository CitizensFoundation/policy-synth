# AgentCostManager

The `AgentCostManager` class provides methods to calculate and retrieve cost breakdowns for AI agent usage within the PolicySynth Agents system. It aggregates token usage and cost data for agents and their sub-agents, supporting detailed and summary cost reporting.

This class interacts with the database using Sequelize and expects the relevant model usage and pricing data to be available in the `ps_model_usage`, `ps_ai_models`, and `ps_agents` tables.

---

## Properties

This class does not expose public properties. All methods are instance methods.

---

## Methods

| Name                       | Parameters                                                                 | Return Type                        | Description                                                                                                 |
|----------------------------|----------------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `getDetailedAgentCosts`    | `agentId: number`                                                          | `Promise<PsDetailedAgentCostResults[]>` | Returns a detailed breakdown of costs for the specified agent and all its sub-agents.                       |
| `getAgentCosts`            | `agentId: number`                                                          | `Promise<PsAgentCostResults>`      | Returns a summary of costs for the specified agent and its sub-agents, grouped by agent and hierarchy level.|
| `getSingleAgentCosts`      | `agentId: number`                                                          | `Promise<string>`                  | Returns the total cost for a single agent (no sub-agents), as a string formatted to two decimal places.     |

---

### Private Methods

| Name             | Parameters                                  | Return Type                | Description                                                                                 |
|------------------|---------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------|
| `getSubAgentIds` | `rootId: number`                            | `Promise<number[]>`        | Recursively retrieves all agent IDs under the given root agent, including the root itself.   |
| `calcCosts`      | `mu: PsModelUsageAttributes, prices: PsBaseModelPriceConfiguration` | `PsCostBreakdown`          | Calculates the cost breakdown for a single model usage record and its associated price config.|

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
- **costInNormal**: Cost for normal input tokens.
- **costInCached**: Cost for cached context input tokens.
- **costInLong**: Cost for long context input tokens.
- **costOutNormal**: Cost for normal output tokens (including reasoning, audio, image).
- **costInCachedLong**: Cost for cached context input tokens in long context.
- **costOutLong**: Cost for long context output tokens (including reasoning, audio, image).
- **totalCost**: Sum of all above costs.

---

## Example

```typescript
import { AgentCostManager } from '@policysynth/agents/operations/agentCostsManager.js';

const agentCostManager = new AgentCostManager();

async function example() {
  const agentId = 42;

  // Get detailed cost breakdown for agent and all sub-agents
  const detailedCosts = await agentCostManager.getDetailedAgentCosts(agentId);
  console.log('Detailed Costs:', detailedCosts);

  // Get summary costs for agent and all sub-agents
  const summaryCosts = await agentCostManager.getAgentCosts(agentId);
  console.log('Summary Costs:', summaryCosts);

  // Get total cost for a single agent (no sub-agents)
  const singleAgentCost = await agentCostManager.getSingleAgentCosts(agentId);
  console.log('Single Agent Cost:', singleAgentCost);
}

example();
```

---

## Method Details

### getDetailedAgentCosts

```typescript
public async getDetailedAgentCosts(agentId: number): Promise<PsDetailedAgentCostResults[]>
```
- **Description**: Returns a detailed breakdown of costs for the specified agent and all its sub-agents. Each entry includes timestamps, agent/model names, token counts, and a full cost breakdown.
- **Returns**: Array of `PsDetailedAgentCostResults` objects.

---

### getAgentCosts

```typescript
public async getAgentCosts(agentId: number): Promise<PsAgentCostResults>
```
- **Description**: Returns a summary of costs for the specified agent and all its sub-agents, grouped by agent and hierarchy level. Includes the total cost.
- **Returns**: An object with `agentCosts` (array of agent cost summaries) and `totalCost` (string).

---

### getSingleAgentCosts

```typescript
public async getSingleAgentCosts(agentId: number): Promise<string>
```
- **Description**: Returns the total cost for a single agent (no sub-agents), formatted as a string with two decimal places.
- **Returns**: String representing the total cost.

---

### getSubAgentIds (private)

```typescript
private async getSubAgentIds(rootId: number): Promise<number[]>
```
- **Description**: Recursively retrieves all agent IDs under the given root agent, including the root itself.
- **Returns**: Array of agent IDs.

---

### calcCosts (private)

```typescript
private calcCosts(
  mu: PsModelUsageAttributes,
  prices: PsBaseModelPriceConfiguration
): PsCostBreakdown
```
- **Description**: Calculates the cost breakdown for a single model usage record and its associated price configuration.
- **Returns**: `PsCostBreakdown` object.

---

## Notes

- All methods are asynchronous and interact with the database.
- The class expects the database schema to match the PolicySynth Agents system, with appropriate fields for token usage and pricing.
- Error handling is included; errors are logged and rethrown as `Error` objects.

---

## See Also

- `PsModelUsageAttributes`
- `PsBaseModelPriceConfiguration`
- `PsAgentCostResults`
- `PsDetailedAgentCostResults`

These types are defined in the PolicySynth Agents type system and are used throughout the cost calculation logic.