# AgentManager

The `AgentManager` class provides methods to manage agents, including creating, updating, and retrieving agents and their configurations. It interacts with various database models such as `PsAgent`, `PsAgentClass`, `PsAiModel`, and others.

## Methods

### getAgent

Retrieves an agent by its group ID. If the top-level agent does not exist, it creates one.

```typescript
async getAgent(groupId: string): Promise<PsAgent>
```

- **Parameters:**
  - `groupId` (string): The ID of the group.

- **Returns:** 
  - `Promise<PsAgent>`: The agent with its sub-agents and connectors.

- **Throws:**
  - `Error`: If the group ID is not provided or the group is not found.

### createAgent

Creates a new agent with the specified class and AI models.

```typescript
async createAgent(
  name: string,
  agentClassId: number,
  aiModels: Record<string, number | string>,
  parentAgentId?: number
): Promise<PsAgent>
```

- **Parameters:**
  - `name` (string): The name of the agent.
  - `agentClassId` (number): The ID of the agent class.
  - `aiModels` (Record<string, number | string>): A record of AI model sizes and their IDs.
  - `parentAgentId` (number, optional): The ID of the parent agent.

- **Returns:** 
  - `Promise<PsAgent>`: The created agent with its associations.

- **Throws:**
  - `Error`: If the agent class ID or AI models are invalid or not found.

### updateAgentConfiguration

Updates the configuration of an existing agent.

```typescript
async updateAgentConfiguration(
  agentId: number,
  updatedConfig: Partial<YpPsAgentConfiguration>
): Promise<void>
```

- **Parameters:**
  - `agentId` (number): The ID of the agent.
  - `updatedConfig` (Partial<YpPsAgentConfiguration>): The updated configuration.

- **Returns:** 
  - `Promise<void>`

- **Throws:**
  - `Error`: If the agent is not found.

### removeAgentAiModel

Removes an AI model from an agent.

```typescript
async removeAgentAiModel(agentId: number, modelId: number): Promise<void>
```

- **Parameters:**
  - `agentId` (number): The ID of the agent.
  - `modelId` (number): The ID of the AI model.

- **Returns:** 
  - `Promise<void>`

- **Throws:**
  - `Error`: If the agent or AI model is not found.

### getAgentAiModels

Retrieves the AI models associated with an agent.

```typescript
async getAgentAiModels(agentId: number): Promise<PsAiModel[]>
```

- **Parameters:**
  - `agentId` (number): The ID of the agent.

- **Returns:** 
  - `Promise<PsAiModel[]>`: The list of AI models associated with the agent.

- **Throws:**
  - `Error`: If the agent is not found.

### addAgentAiModel

Adds an AI model to an agent.

```typescript
async addAgentAiModel(agentId: number, modelId: number, size: string): Promise<void>
```

- **Parameters:**
  - `agentId` (number): The ID of the agent.
  - `modelId` (number): The ID of the AI model.
  - `size` (string): The size of the AI model.

- **Returns:** 
  - `Promise<void>`

- **Throws:**
  - `Error`: If the agent or AI model is not found.

### createTopLevelAgent

Creates a top-level agent for a group.

```typescript
private async createTopLevelAgent(group: Group): Promise<PsAgent>
```

- **Parameters:**
  - `group` (Group): The group for which to create the top-level agent.

- **Returns:** 
  - `Promise<PsAgent>`: The created top-level agent.

- **Throws:**
  - `Error`: If the default agent class UUID is not configured or the agent class is not found.

### fetchAgentWithSubAgents

Fetches an agent along with its sub-agents and connectors.

```typescript
private async fetchAgentWithSubAgents(agentId: number): Promise<PsAgent>
```

- **Parameters:**
  - `agentId` (number): The ID of the agent.

- **Returns:** 
  - `Promise<PsAgent>`: The agent with its sub-agents and connectors.

- **Throws:**
  - `Error`: If the agent is not found.

## Example

```typescript
import { AgentManager } from '@policysynth/agents/operations/agentManager.js';

const agentManager = new AgentManager();

// Example usage: Get an agent by group ID
agentManager.getAgent('group-id-123')
  .then(agent => console.log(agent))
  .catch(error => console.error(error));

// Example usage: Create a new agent
agentManager.createAgent('New Agent', 1, { small: 1, large: 2 })
  .then(agent => console.log(agent))
  .catch(error => console.error(error));

// Example usage: Update agent configuration
agentManager.updateAgentConfiguration(1, { topLevelAgentId: 2 })
  .then(() => console.log('Configuration updated'))
  .catch(error => console.error(error));

// Example usage: Remove an AI model from an agent
agentManager.removeAgentAiModel(1, 2)
  .then(() => console.log('AI model removed'))
  .catch(error => console.error(error));

// Example usage: Get AI models of an agent
agentManager.getAgentAiModels(1)
  .then(models => console.log(models))
  .catch(error => console.error(error));

// Example usage: Add an AI model to an agent
agentManager.addAgentAiModel(1, 2, 'medium')
  .then(() => console.log('AI model added'))
  .catch(error => console.error(error));
```

This documentation provides a comprehensive overview of the `AgentManager` class, its methods, and example usage.