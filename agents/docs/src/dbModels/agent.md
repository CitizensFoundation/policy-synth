# PsAgent

Represents an AI Agent instance in the PolicySynth system. Each agent is an instantiation of an agent class, associated with a user, group, and configuration, and can be connected to models, connectors, and other agents.

**File:** `@policysynth/agents/dbModels/agent.js`

## Properties

| Name                | Type                                         | Description                                                                                 |
|---------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| id                  | `number`                                     | Unique identifier for the agent (primary key).                                              |
| uuid                | `string`                                     | Universally unique identifier for the agent.                                                |
| user_id             | `number`                                     | ID of the user who owns or created the agent.                                               |
| created_at          | `Date`                                       | Timestamp when the agent was created.                                                       |
| updated_at          | `Date`                                       | Timestamp when the agent was last updated.                                                  |
| class_id            | `number`                                     | ID of the agent class this agent is an instance of.                                         |
| group_id            | `number`                                     | ID of the group this agent belongs to.                                                      |
| configuration       | `PsBaseNodeConfiguration`                    | JSON configuration for the agent instance.                                                  |
| parent_agent_id     | `number \| undefined`                        | (Optional) ID of the parent agent, if this agent is a sub-agent.                            |

### Associations

| Name               | Type                                   | Description                                                                                 |
|--------------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| Class              | `PsAgentClass \| undefined`            | The agent class this agent is an instance of.                                               |
| User               | `YpUserData \| undefined`              | The user who owns or created the agent.                                                     |
| Group              | `YpGroupData \| undefined`             | The group this agent belongs to.                                                            |
| ExternalApiUsage   | `PsExternalApiUsageAttributes[]`       | List of external API usage records for this agent.                                          |
| ModelUsage         | `PsModelUsageAttributes[]`             | List of model usage records for this agent.                                                 |
| ParentAgent        | `PsAgent \| undefined`                 | The parent agent, if this agent is a sub-agent.                                             |
| SubAgents          | `PsAgent[] \| undefined`               | List of sub-agents (children) of this agent.                                                |
| AiModels           | `PsAiModelAttributes[] \| undefined`   | List of AI models associated with this agent.                                               |
| InputConnectors    | `PsAgentConnectorAttributes[]`         | List of input connectors for this agent.                                                    |
| OutputConnectors   | `PsAgentConnectorAttributes[]`         | List of output connectors for this agent.                                                   |

### Virtual Properties

| Name             | Type     | Description                                                        |
|------------------|----------|--------------------------------------------------------------------|
| redisMemoryKey   | `string` | Redis key for storing agent memory.                                |
| redisStatusKey   | `string` | Redis key for storing agent status.                                |

## Methods

### Input Connectors

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|-------------------------------------------------|---------------------|--------------------------------------------------|
| addInputConnector      | connector: PsAgentConnector, obj?: any          | Promise<void>       | Add a single input connector to the agent.        |
| addInputConnectors     | connectors: PsAgentConnector[]                  | Promise<void>       | Add multiple input connectors to the agent.       |
| getInputConnectors     |                                                 | Promise<PsAgentConnector[]> | Get all input connectors for the agent.           |
| setInputConnectors     | connectors: PsAgentConnector[]                  | Promise<void>       | Set the input connectors for the agent.           |
| removeInputConnectors  | connectors: PsAgentConnector[]                  | Promise<void>       | Remove input connectors from the agent.           |

### Output Connectors

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|-------------------------------------------------|---------------------|--------------------------------------------------|
| addOutputConnector     | connector: PsAgentConnector, obj?: any          | Promise<void>       | Add a single output connector to the agent.       |
| addOutputConnectors    | connectors: PsAgentConnector[]                  | Promise<void>       | Add multiple output connectors to the agent.      |
| getOutputConnectors    |                                                 | Promise<PsAgentConnector[]> | Get all output connectors for the agent.          |
| setOutputConnectors    | connectors: PsAgentConnector[]                  | Promise<void>       | Set the output connectors for the agent.          |
| removeOutputConnectors | connectors: PsAgentConnector[]                  | Promise<void>       | Remove output connectors from the agent.          |

### Sub-Agents

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|-------------------------------------------------|---------------------|--------------------------------------------------|
| addSubAgent            | agent: PsAgent                                  | Promise<void>       | Add a single sub-agent (child) to this agent.     |
| addSubAgents           | agents: PsAgent[]                               | Promise<void>       | Add multiple sub-agents to this agent.            |
| getSubAgents           |                                                 | Promise<PsAgent[]>  | Get all sub-agents (children) of this agent.      |
| setSubAgents           | agents: PsAgent[]                               | Promise<void>       | Set the sub-agents for this agent.                |
| removeSubAgents        | agents: PsAgent[]                               | Promise<void>       | Remove sub-agents from this agent.                |

### AI Models

| Name                   | Parameters                                      | Return Type         | Description                                      |
|------------------------|-------------------------------------------------|---------------------|--------------------------------------------------|
| addAiModel             | model: PsAiModel, obj?: any                     | Promise<void>       | Add a single AI model to the agent.               |
| addAiModels            | models: PsAiModel[]                             | Promise<void>       | Add multiple AI models to the agent.              |
| getAiModels            |                                                 | Promise<PsAiModel[]>| Get all AI models associated with the agent.      |
| setAiModels            | models: PsAiModel[]                             | Promise<void>       | Set the AI models for the agent.                  |
| removeAiModel          | model: PsAiModel                                | Promise<boolean>    | Remove a single AI model from the agent.          |
| removeAiModels         | models: PsAiModel[]                             | Promise<void>       | Remove multiple AI models from the agent.         |

## Sequelize Model Definition

- **Table Name:** `ps_agents`
- **Indexes:** On `uuid` (unique), `user_id`, `class_id`, `group_id`, `parent_agent_id`
- **Timestamps:** `created_at`, `updated_at`
- **Underscored:** true (snake_case columns)

## Associations

- **Belongs to:** `PsAgentClass` (as `Class`)
- **Belongs to:** `User` (as `User`)
- **Belongs to:** `Group` (as `Group`)
- **Has many:** `PsExternalApiUsage` (as `ExternalApiUsage`)
- **Has many:** `PsModelUsage` (as `ModelUsage`)
- **Belongs to:** `PsAiModel` (as `AiModel`)
- **Has many:** `PsAgent` (as `SubAgents`)
- **Belongs to:** `PsAgent` (as `ParentAgent`)
- **Belongs to many:** `PsAiModel` (as `AiModels`, through `AgentModels`)
- **Belongs to many:** `PsAgentConnector` (as `InputConnectors`, through `AgentInputConnectors`)
- **Belongs to many:** `PsAgentConnector` (as `OutputConnectors`, through `AgentOutputConnectors`)

## Example

```typescript
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';
import { PsAgentConnector } from '@policysynth/agents/dbModels/agentConnector.js';
import { PsAiModel } from '@policysynth/agents/dbModels/aiModel.js';

// Creating a new agent
const agent = await PsAgent.create({
  user_id: 1,
  class_id: 2,
  group_id: 3,
  configuration: {
    name: "My Agent",
    graphPosX: 100,
    graphPosY: 200,
    // ...other configuration fields
  }
});

// Adding input connectors
const connector = await PsAgentConnector.findByPk(1);
await agent.addInputConnector(connector);

// Adding AI models
const aiModel = await PsAiModel.findByPk(1);
await agent.addAiModel(aiModel);

// Accessing redis keys
console.log(agent.redisMemoryKey); // ps:agent:memory:123:uuid-abc
console.log(agent.redisStatusKey); // ps:agent:status:123:uuid-abc

// Getting sub-agents
const subAgents = await agent.getSubAgents();
```

---

**Note:**  
- The `PsAgent` class is a Sequelize model and supports all standard Sequelize instance and static methods.
- The configuration property is a flexible JSON object (`PsBaseNodeConfiguration`) that defines the agent's runtime and operational parameters.
- Associations are set up for rich querying and manipulation of related entities (agent class, user, group, connectors, models, etc.).