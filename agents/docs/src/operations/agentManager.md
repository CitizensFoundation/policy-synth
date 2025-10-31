# AgentManager

The `AgentManager` class provides a high-level interface for managing AI agents, their configurations, and their relationships within groups in the PolicySynth system. It extends `PolicySynthAgentBase` and interacts with various database models to create, update, and retrieve agents, their AI models, and their hierarchical structure.

## Properties

This class does not define its own properties, but inherits from `PolicySynthAgentBase` and uses injected models and logger.

## Methods

| Name                          | Parameters                                                                                                                                                                                                                                    | Return Type                | Description                                                                                                 |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| `getAgent`                    | `groupId: string`                                                                                                                                                                                                                            | `Promise<any>`             | Retrieves the top-level agent for a group, creating it if it does not exist, and returns it with sub-agents.|
| `getSubAgentMemoryKey`        | `groupId: string, agentId: number`                                                                                                                                                                                                           | `Promise<string \| null>`  | Recursively searches for a sub-agent by ID within a group and returns its memory key for Redis.             |
| `createAgent`                 | `name: string, agentClassId: number, aiModels: Record<string, number \| string>, groupId: number, userId: number, parentAgentId?: number`                                                                                                     | `Promise<PsAgent>`         | Creates a new agent with the specified class, AI models, and associations.                                  |
| `updateAgentConfiguration`    | `agentId: number, updatedConfig: Partial<YpPsAgentConfiguration>`                                                                                                                                                                            | `Promise<void>`            | Updates the configuration of an agent by merging new values.                                                |
| `removeAgentAiModel`          | `agentId: number, modelId: number`                                                                                                                                                                                                           | `Promise<void>`            | Removes an AI model association from an agent.                                                              |
| `getAgentAiModels`            | `agentId: number`                                                                                                                                                                                                                            | `Promise<PsAiModel[]>`     | Retrieves all AI models associated with an agent.                                                           |
| `addAgentAiModel`             | `agentId: number, modelId: number, size: string`                                                                                                                                                                                            | `Promise<void>`            | Adds an AI model to an agent for a specific size.                                                           |
| `createTopLevelAgent`         | `group: Group`                                                                                                                                                                                                                               | `Promise<PsAgent>`         | Creates a top-level agent for a group and updates the group's configuration.                                 |
| `fetchAgentWithSubAgents`     | `agentId: number`                                                                                                                                                                                                                            | `Promise<any>`             | Fetches an agent and all its sub-agents, connectors, models, and related associations.                      |

---

### Method Details

#### getAgent

Retrieves the top-level agent for a given group. If the agent does not exist, it creates one and returns the agent with all its sub-agents and associations.

- **Parameters:**  
  - `groupId: string` — The ID of the group.
- **Returns:**  
  - `Promise<any>` — The agent object with sub-agents and associations.

#### getSubAgentMemoryKey

Finds a sub-agent by ID within a group and returns its Redis memory key.

- **Parameters:**  
  - `groupId: string` — The group ID.
  - `agentId: number` — The agent ID to search for.
- **Returns:**  
  - `Promise<string | null>` — The Redis memory key for the agent, or null if not found.

#### createAgent

Creates a new agent with the specified class, AI models, and associations.

- **Parameters:**  
  - `name: string` — The agent's name.
  - `agentClassId: number` — The agent class ID.
  - `aiModels: Record<string, number | string>` — Mapping of model sizes to model IDs.
  - `groupId: number` — The group ID.
  - `userId: number` — The user ID.
  - `parentAgentId?: number` — (Optional) Parent agent ID.
- **Returns:**  
  - `Promise<PsAgent>` — The created agent with its associations.

#### updateAgentConfiguration

Updates the configuration of an agent by merging the provided configuration with the existing one.

- **Parameters:**  
  - `agentId: number` — The agent ID.
  - `updatedConfig: Partial<YpPsAgentConfiguration>` — The configuration updates.
- **Returns:**  
  - `Promise<void>`

#### removeAgentAiModel

Removes an AI model association from an agent.

- **Parameters:**  
  - `agentId: number` — The agent ID.
  - `modelId: number` — The AI model ID.
- **Returns:**  
  - `Promise<void>`

#### getAgentAiModels

Retrieves all AI models associated with an agent.

- **Parameters:**  
  - `agentId: number` — The agent ID.
- **Returns:**  
  - `Promise<PsAiModel[]>` — Array of AI models.

#### addAgentAiModel

Adds an AI model to an agent for a specific size.

- **Parameters:**  
  - `agentId: number` — The agent ID.
  - `modelId: number` — The AI model ID.
  - `size: string` — The model size (e.g., "small", "large").
- **Returns:**  
  - `Promise<void>`

#### createTopLevelAgent

Creates a top-level agent for a group and updates the group's configuration to reference it.

- **Parameters:**  
  - `group: Group` — The group instance.
- **Returns:**  
  - `Promise<PsAgent>` — The created top-level agent.

#### fetchAgentWithSubAgents

Fetches an agent and all its sub-agents, connectors, models, and related associations.

- **Parameters:**  
  - `agentId: number` — The agent ID.
- **Returns:**  
  - `Promise<any>` — The agent object with all associations.

---

## Example

```typescript
import { AgentManager } from '@policysynth/agents/operations/agentManager.js';

// Example: Creating a new agent
const agentManager = new AgentManager();

const newAgent = await agentManager.createAgent(
  "Research Agent",
  1, // agentClassId
  { "large": 2 }, // aiModels: { size: modelId }
  10, // groupId
  5   // userId
);

// Example: Fetching the top-level agent for a group
const agent = await agentManager.getAgent("10");

// Example: Adding an AI model to an agent
await agentManager.addAgentAiModel(agent.id, 3, "medium");

// Example: Updating agent configuration
await agentManager.updateAgentConfiguration(agent.id, { topLevelAgentId: 123 });

// Example: Getting the memory key for a sub-agent
const memoryKey = await agentManager.getSubAgentMemoryKey("10", agent.id);
```

---

**Note:**  
- All methods throw errors if entities are not found or if required parameters are missing.
- Transactions are used for operations that modify multiple related records to ensure data integrity.
- The class expects certain environment variables (e.g., `CLASS_ID_FOR_TOP_LEVEL_AGENT`) to be set for default behaviors.