# AgentManager

The `AgentManager` class is responsible for managing agents within a system. It provides methods to create, update, and retrieve agents and their configurations, as well as manage their associated AI models.

## Methods

| Name                          | Parameters                                                                 | Return Type                  | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `getAgent`                    | `groupId: string`                                                          | `Promise<PsAgent>`           | Retrieves the top-level agent for a given group, creating it if necessary.  |
| `getSubAgentMemoryKey`        | `groupId: string, agentId: number`                                         | `Promise<string \| null>`    | Finds and returns the memory key for a specific sub-agent within a group.   |
| `createAgent`                 | `name: string, agentClassId: number, aiModels: Record<string, number \| string>, groupId: number, userId: number, parentAgentId?: number` | `Promise<PsAgent>`           | Creates a new agent with the specified parameters and associates AI models. |
| `updateAgentConfiguration`    | `agentId: number, updatedConfig: Partial<YpPsAgentConfiguration>`          | `Promise<void>`              | Updates the configuration of an existing agent.                             |
| `removeAgentAiModel`          | `agentId: number, modelId: number`                                         | `Promise<void>`              | Removes an AI model from an agent.                                          |
| `getAgentAiModels`            | `agentId: number`                                                          | `Promise<PsAiModel[]>`       | Retrieves the AI models associated with a specific agent.                   |
| `addAgentAiModel`             | `agentId: number, modelId: number, size: string`                           | `Promise<void>`              | Adds an AI model to an agent.                                               |
| `createTopLevelAgent`         | `group: Group`                                                             | `Promise<PsAgent>`           | Creates a top-level agent for a group if it doesn't exist.                  |
| `fetchAgentWithSubAgents`     | `agentId: number`                                                          | `Promise<any>`               | Fetches an agent along with its sub-agents and related data.                |

## Example

```typescript
import { AgentManager } from '@policysynth/agents/operations/agentManager.js';

const agentManager = new AgentManager();

// Example usage: Create a new agent
const newAgent = await agentManager.createAgent(
  "Agent Name",
  1, // agentClassId
  { small: 123, medium: 456 }, // aiModels
  1, // groupId
  1  // userId
);

// Example usage: Get an agent
const agent = await agentManager.getAgent("group-id");

// Example usage: Update agent configuration
await agentManager.updateAgentConfiguration(agent.id, { topLevelAgentId: 2 });
```

### Notes

- The `AgentManager` class interacts with several database models such as `PsAgent`, `PsAgentConnector`, `PsAgentClass`, `User`, `Group`, `PsExternalApiUsage`, `PsModelUsage`, and `PsAiModel`.
- Transactions are used to ensure atomic operations when creating or updating agents.
- The class provides comprehensive error handling to ensure that operations fail gracefully when encountering issues such as missing data or invalid parameters.