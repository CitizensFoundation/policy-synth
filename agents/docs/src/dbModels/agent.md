# PsAgent

The `PsAgent` class represents an AI agent instance in the PolicySynth Agents system. It is a Sequelize model mapped to the `ps_agents` table and encapsulates the configuration, associations, and management of an agent, including its relationships to users, groups, agent classes, connectors, and AI models.

## Properties

| Name                | Type                                         | Description                                                                                 |
|---------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| id                  | number                                       | Primary key. Unique identifier for the agent.                                               |
| uuid                | string                                       | Universally unique identifier for the agent.                                                |
| user_id             | number                                       | Foreign key referencing the user who owns/created the agent.                                |
| created_at          | Date                                         | Timestamp when the agent was created.                                                       |
| updated_at          | Date                                         | Timestamp when the agent was last updated.                                                  |
| class_id            | number                                       | Foreign key referencing the agent class (type/blueprint of the agent).                      |
| group_id            | number                                       | Foreign key referencing the group to which the agent belongs.                               |
| configuration       | PsBaseNodeConfiguration                      | JSON configuration object for the agent instance.                                           |
| parent_agent_id     | number \| undefined                          | Optional foreign key referencing the parent agent (for agent hierarchies).                  |
| Class               | PsAgentClass \| undefined                    | Associated agent class instance.                                                            |
| User                | YpUserData \| undefined                      | Associated user instance.                                                                   |
| Group               | YpGroupData \| undefined                     | Associated group instance.                                                                  |
| ExternalApiUsage    | PsExternalApiUsageAttributes[] \| undefined  | Associated external API usage records.                                                      |
| ModelUsage          | PsModelUsageAttributes[] \| undefined        | Associated AI model usage records.                                                          |
| ParentAgent         | PsAgent \| undefined                         | Associated parent agent instance.                                                           |
| SubAgents           | PsAgent[] \| undefined                       | Associated sub-agent instances (children).                                                  |
| AiModels            | PsAiModelAttributes[] \| undefined           | Associated AI models (many-to-many).                                                        |
| InputConnectors     | PsAgentConnectorAttributes[] \| undefined    | Associated input connectors (many-to-many).                                                 |
| OutputConnectors    | PsAgentConnectorAttributes[] \| undefined    | Associated output connectors (many-to-many).                                                |

### Virtual Properties

| Name             | Type    | Description                                                      |
|------------------|---------|------------------------------------------------------------------|
| redisMemoryKey   | string  | Redis key for storing agent memory (e.g., `ps:agent:memory:...`). |
| redisStatusKey   | string  | Redis key for storing agent status (e.g., `ps:agent:status:...`). |

## Methods

### Connector Association Methods

| Name                      | Parameters                                      | Return Type         | Description                                      |
|---------------------------|------------------------------------------------|---------------------|--------------------------------------------------|
| addInputConnector         | connector: PsAgentConnector, obj?: any         | Promise<void>       | Add a single input connector.                    |
| addInputConnectors        | connectors: PsAgentConnector[]                 | Promise<void>       | Add multiple input connectors.                   |
| getInputConnectors        |                                                | Promise<PsAgentConnector[]> | Get all input connectors.                        |
| setInputConnectors        | connectors: PsAgentConnector[]                 | Promise<void>       | Set input connectors (replace all).              |
| removeInputConnectors     | connectors: PsAgentConnector[]                 | Promise<void>       | Remove input connectors.                         |
| addOutputConnector        | connector: PsAgentConnector, obj?: any         | Promise<void>       | Add a single output connector.                   |
| addOutputConnectors       | connectors: PsAgentConnector[]                 | Promise<void>       | Add multiple output connectors.                  |
| getOutputConnectors       |                                                | Promise<PsAgentConnector[]> | Get all output connectors.                       |
| setOutputConnectors       | connectors: PsAgentConnector[]                 | Promise<void>       | Set output connectors (replace all).             |
| removeOutputConnectors    | connectors: PsAgentConnector[]                 | Promise<void>       | Remove output connectors.                        |

### Sub-Agent Association Methods

| Name                      | Parameters                                      | Return Type         | Description                                      |
|---------------------------|------------------------------------------------|---------------------|--------------------------------------------------|
| addSubAgent               | agent: PsAgent                                 | Promise<void>       | Add a single sub-agent (child).                  |
| addSubAgents              | agents: PsAgent[]                              | Promise<void>       | Add multiple sub-agents.                         |
| getSubAgents              |                                                | Promise<PsAgent[]>  | Get all sub-agents (children).                   |
| setSubAgents              | agents: PsAgent[]                              | Promise<void>       | Set sub-agents (replace all).                    |
| removeSubAgents           | agents: PsAgent[]                              | Promise<void>       | Remove sub-agents.                               |

### AI Model Association Methods

| Name                      | Parameters                                      | Return Type         | Description                                      |
|---------------------------|------------------------------------------------|---------------------|--------------------------------------------------|
| addAiModel                | model: PsAiModel, obj?: any                    | Promise<void>       | Add a single AI model.                           |
| addAiModels               | models: PsAiModel[]                            | Promise<void>       | Add multiple AI models.                          |
| getAiModels               |                                                | Promise<PsAiModel[]>| Get all associated AI models.                    |
| setAiModels               | models: PsAiModel[]                            | Promise<void>       | Set AI models (replace all).                     |
| removeAiModel             | model: PsAiModel                               | Promise<boolean>    | Remove a single AI model.                        |
| removeAiModels            | models: PsAiModel[]                            | Promise<void>       | Remove multiple AI models.                       |

## Sequelize Model Initialization

- Table name: `ps_agents`
- Indexes: `uuid` (unique), `user_id`, `class_id`, `group_id`, `parent_agent_id`
- Timestamps: `created_at`, `updated_at`
- Underscored: true (snake_case columns)

## Associations

- **Belongs to**: `PsAgentClass` (as `Class`)
- **Belongs to**: `User` (as `User`)
- **Belongs to**: `Group` (as `Group`)
- **Has many**: `PsExternalApiUsage` (as `ExternalApiUsage`)
- **Has many**: `PsModelUsage` (as `ModelUsage`)
- **Belongs to**: `PsAiModel` (as `AiModel`, via `parent_agent_id`)
- **Has many**: `PsAgent` (as `SubAgents`, via `parent_agent_id`)
- **Belongs to**: `PsAgent` (as `ParentAgent`, via `parent_agent_id`)
- **Belongs to many**: `PsAiModel` (as `AiModels`, through `AgentModels`)
- **Belongs to many**: `PsAgentConnector` (as `InputConnectors`, through `AgentInputConnectors`)
- **Belongs to many**: `PsAgentConnector` (as `OutputConnectors`, through `AgentOutputConnectors`)

## Example

```typescript
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { User } from '@policysynth/agents/dbModels/ypUser.js';
import { Group } from '@policysynth/agents/dbModels/ypGroup.js';

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

// Adding an input connector
await agent.addInputConnector(connectorInstance);

// Getting all sub-agents
const subAgents = await agent.getSubAgents();

// Accessing the redis memory key for this agent
const memoryKey = agent.redisMemoryKey;
```

---

**File:** `@policysynth/agents/dbModels/agent.js`