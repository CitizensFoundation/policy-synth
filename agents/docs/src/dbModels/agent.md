# PsAgent

Represents an AI Agent instance in the PolicySynth system. Each agent is an instantiation of an agent class, associated with a user, group, and can have input/output connectors, AI models, and sub-agents. This model is mapped to the `ps_agents` table in the database.

## Properties

| Name                | Type                                         | Description                                                                                 |
|---------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| id                  | number                                       | Primary key, auto-incremented agent ID.                                                     |
| uuid                | string                                       | Universally unique identifier for the agent.                                                |
| user_id             | number                                       | ID of the user who owns/created the agent.                                                  |
| created_at          | Date                                         | Timestamp when the agent was created.                                                       |
| updated_at          | Date                                         | Timestamp when the agent was last updated.                                                  |
| class_id            | number                                       | Foreign key to the agent class (`PsAgentClass`).                                            |
| group_id            | number                                       | Foreign key to the group (`Group`) the agent belongs to.                                    |
| configuration       | PsBaseNodeConfiguration                      | JSON configuration for the agent instance.                                                  |
| parent_agent_id     | number \| undefined                          | Optional foreign key to a parent agent (for agent hierarchies).                             |
| Class               | PsAgentClass \| undefined                    | Associated agent class instance.                                                            |
| User                | YpUserData \| undefined                      | Associated user instance.                                                                   |
| Group               | YpGroupData \| undefined                     | Associated group instance.                                                                  |
| ExternalApiUsage    | PsExternalApiUsageAttributes[] \| undefined  | List of external API usage records for this agent.                                          |
| ModelUsage          | PsModelUsageAttributes[] \| undefined         | List of AI model usage records for this agent.                                              |
| ParentAgent         | PsAgent \| undefined                         | Reference to the parent agent, if any.                                                      |
| SubAgents           | PsAgent[] \| undefined                       | List of sub-agents (children) of this agent.                                                |
| AiModels            | PsAiModelAttributes[] \| undefined           | List of associated AI models.                                                               |
| InputConnectors     | PsAgentConnectorAttributes[] \| undefined    | List of input connectors for this agent.                                                    |
| OutputConnectors    | PsAgentConnectorAttributes[] \| undefined    | List of output connectors for this agent.                                                   |

### Virtual Properties

| Name             | Type   | Description                                               |
|------------------|--------|-----------------------------------------------------------|
| redisMemoryKey   | string | Redis key for storing agent memory.                       |
| redisStatusKey   | string | Redis key for storing agent status.                       |

## Methods

### Input Connectors

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|------------------------------------------------|---------------------|--------------------------------------------------|
| addInputConnector      | connector: PsAgentConnector, obj?: any         | Promise<void>       | Add a single input connector.                    |
| addInputConnectors     | connectors: PsAgentConnector[]                 | Promise<void>       | Add multiple input connectors.                   |
| getInputConnectors     |                                                | Promise<PsAgentConnector[]> | Get all input connectors.                        |
| setInputConnectors     | connectors: PsAgentConnector[]                 | Promise<void>       | Set input connectors (replace all).              |
| removeInputConnectors  | connectors: PsAgentConnector[]                 | Promise<void>       | Remove input connectors.                         |

### Output Connectors

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|------------------------------------------------|---------------------|--------------------------------------------------|
| addOutputConnector     | connector: PsAgentConnector, obj?: any         | Promise<void>       | Add a single output connector.                   |
| addOutputConnectors    | connectors: PsAgentConnector[]                 | Promise<void>       | Add multiple output connectors.                  |
| getOutputConnectors    |                                                | Promise<PsAgentConnector[]> | Get all output connectors.                       |
| setOutputConnectors    | connectors: PsAgentConnector[]                 | Promise<void>       | Set output connectors (replace all).             |
| removeOutputConnectors | connectors: PsAgentConnector[]                 | Promise<void>       | Remove output connectors.                        |

### Sub-Agents

| Name               | Parameters                | Return Type         | Description                                      |
|--------------------|--------------------------|---------------------|--------------------------------------------------|
| addSubAgent        | agent: PsAgent           | Promise<void>       | Add a single sub-agent.                          |
| addSubAgents       | agents: PsAgent[]        | Promise<void>       | Add multiple sub-agents.                         |
| getSubAgents       |                          | Promise<PsAgent[]>  | Get all sub-agents.                              |
| setSubAgents       | agents: PsAgent[]        | Promise<void>       | Set sub-agents (replace all).                    |
| removeSubAgents    | agents: PsAgent[]        | Promise<void>       | Remove sub-agents.                               |

### AI Models

| Name               | Parameters                | Return Type         | Description                                      |
|--------------------|--------------------------|---------------------|--------------------------------------------------|
| addAiModel         | model: PsAiModel, obj?: any | Promise<void>     | Add a single AI model.                           |
| addAiModels        | models: PsAiModel[]       | Promise<void>       | Add multiple AI models.                          |
| getAiModels        |                          | Promise<PsAiModel[]>| Get all associated AI models.                    |
| setAiModels        | models: PsAiModel[]       | Promise<void>       | Set AI models (replace all).                     |
| removeAiModel      | model: PsAiModel          | Promise<boolean>    | Remove a single AI model.                        |
| removeAiModels     | models: PsAiModel[]       | Promise<void>       | Remove multiple AI models.                       |

### Redis Keys

| Name             | Return Type | Description                                 |
|------------------|-------------|---------------------------------------------|
| redisMemoryKey   | string      | Returns the Redis key for agent memory.     |
| redisStatusKey   | string      | Returns the Redis key for agent status.     |

## Sequelize Model Configuration

- **Table Name:** `ps_agents`
- **Indexes:** On `uuid` (unique), `user_id`, `class_id`, `group_id`, `parent_agent_id`
- **Timestamps:** `created_at`, `updated_at`
- **Underscored:** true (snake_case columns)

## Associations

- **Belongs To:**  
  - `PsAgentClass` as `Class` (via `class_id`)
  - `User` as `User` (via `user_id`)
  - `Group` as `Group` (via `group_id`)
  - `PsAgent` as `ParentAgent` (via `parent_agent_id`)
- **Has Many:**  
  - `PsExternalApiUsage` as `ExternalApiUsage` (via `agent_id`)
  - `PsModelUsage` as `ModelUsage` (via `agent_id`)
  - `PsAgent` as `SubAgents` (via `parent_agent_id`)
- **Belongs To Many:**  
  - `PsAiModel` as `AiModels` (through `AgentModels`)
  - `PsAgentConnector` as `InputConnectors` (through `AgentInputConnectors`)
  - `PsAgentConnector` as `OutputConnectors` (through `AgentOutputConnectors`)

## Example

```typescript
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { YpUserData } from '@policysynth/agents/dbModels/ypUser.js';
import { YpGroupData } from '@policysynth/agents/dbModels/ypGroup.js';

// Creating a new agent
const agent = await PsAgent.create({
  user_id: 1,
  class_id: 2,
  group_id: 3,
  configuration: {
    name: "My Research Agent",
    graphPosX: 100,
    graphPosY: 200,
    // ...other configuration fields
  }
});

// Adding input connectors
await agent.addInputConnector(connectorInstance);

// Accessing associated class
const agentClass = await agent.getClass();

// Getting Redis keys
const memoryKey = agent.redisMemoryKey;
const statusKey = agent.redisStatusKey;
```

---

**File:** `@policysynth/agents/dbModels/agent.js`  
This model is central to the PolicySynth agent orchestration system, supporting complex agent hierarchies, connector relationships, and AI model associations.