# PsAgent

The `PsAgent` class represents an agent in the system, which is a model that can perform various tasks and interact with other components such as connectors and AI models. It extends the Sequelize `Model` class and implements the `PsAgentAttributes` interface.

## Properties

| Name                  | Type                              | Description                                                                 |
|-----------------------|-----------------------------------|-----------------------------------------------------------------------------|
| id                    | number                            | The unique identifier for the agent.                                        |
| uuid                  | string                            | The universally unique identifier for the agent.                            |
| user_id               | number                            | The ID of the user associated with the agent.                               |
| created_at            | Date                              | The date and time when the agent was created.                               |
| updated_at            | Date                              | The date and time when the agent was last updated.                          |
| class_id              | number                            | The ID of the class to which the agent belongs.                             |
| group_id              | number                            | The ID of the group associated with the agent.                              |
| configuration         | PsBaseNodeConfiguration           | The configuration settings for the agent.                                   |
| parent_agent_id       | number \| undefined               | The ID of the parent agent, if any.                                         |
| Class                 | PsAgentClass \| undefined         | The class associated with the agent.                                        |
| User                  | YpUserData \| undefined           | The user associated with the agent.                                         |
| Group                 | YpGroupData \| undefined          | The group associated with the agent.                                        |
| ExternalApiUsage      | PsExternalApiUsageAttributes[]    | The external API usage records associated with the agent.                   |
| ModelUsage            | PsModelUsageAttributes[]          | The model usage records associated with the agent.                          |
| ParentAgent           | PsAgent \| undefined              | The parent agent, if any.                                                   |
| SubAgents             | PsAgent[] \| undefined            | The sub-agents associated with the agent.                                   |
| AiModels              | PsAiModelAttributes[] \| undefined| The AI models associated with the agent.                                    |
| InputConnectors       | PsAgentConnectorAttributes[] \| undefined | The input connectors associated with the agent.                        |
| OutputConnectors      | PsAgentConnectorAttributes[] \| undefined | The output connectors associated with the agent.                       |

## Methods

| Name                  | Parameters                                      | Return Type         | Description                                                                 |
|-----------------------|-------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| addInputConnector     | connector: PsAgentConnector, obj?: any          | Promise<void>       | Adds a single input connector to the agent.                                 |
| addInputConnectors    | connectors: PsAgentConnector[]                  | Promise<void>       | Adds multiple input connectors to the agent.                                |
| getInputConnectors    |                                                 | Promise<PsAgentConnector[]> | Retrieves all input connectors associated with the agent.            |
| setInputConnectors    | connectors: PsAgentConnector[]                  | Promise<void>       | Sets the input connectors for the agent.                                    |
| removeInputConnectors | connectors: PsAgentConnector[]                  | Promise<void>       | Removes specified input connectors from the agent.                          |
| addOutputConnector    | connector: PsAgentConnector, obj?: any          | Promise<void>       | Adds a single output connector to the agent.                                |
| addOutputConnectors   | connectors: PsAgentConnector[]                  | Promise<void>       | Adds multiple output connectors to the agent.                               |
| getOutputConnectors   |                                                 | Promise<PsAgentConnector[]> | Retrieves all output connectors associated with the agent.           |
| setOutputConnectors   | connectors: PsAgentConnector[]                  | Promise<void>       | Sets the output connectors for the agent.                                   |
| removeOutputConnectors| connectors: PsAgentConnector[]                  | Promise<void>       | Removes specified output connectors from the agent.                         |
| addSubAgent           | agent: PsAgent                                  | Promise<void>       | Adds a sub-agent to the agent.                                              |
| addSubAgents          | agents: PsAgent[]                               | Promise<void>       | Adds multiple sub-agents to the agent.                                      |
| getSubAgents          |                                                 | Promise<PsAgent[]>  | Retrieves all sub-agents associated with the agent.                         |
| setSubAgents          | agents: PsAgent[]                               | Promise<void>       | Sets the sub-agents for the agent.                                          |
| removeSubAgents       | agents: PsAgent[]                               | Promise<void>       | Removes specified sub-agents from the agent.                                |
| addAiModel            | model: PsAiModel, obj?: any                     | Promise<void>       | Adds a single AI model to the agent.                                        |
| addAiModels           | models: PsAiModel[]                             | Promise<void>       | Adds multiple AI models to the agent.                                       |
| getAiModels           |                                                 | Promise<PsAiModel[]>| Retrieves all AI models associated with the agent.                          |
| setAiModels           | models: PsAiModel[]                             | Promise<void>       | Sets the AI models for the agent.                                           |
| removeAiModel         | model: PsAiModel                                | Promise<boolean>    | Removes a specified AI model from the agent.                                |
| removeAiModels        | models: PsAiModel[]                             | Promise<void>       | Removes specified AI models from the agent.                                 |

## Example

```typescript
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

// Example usage of PsAgent
const agent = await PsAgent.create({
  user_id: 1,
  class_id: 1,
  group_id: 1,
  configuration: { name: "Example Agent", graphPosX: 0, graphPosY: 0 },
});

// Add an input connector
const connector = await PsAgentConnector.findByPk(1);
if (connector) {
  await agent.addInputConnector(connector);
}

// Retrieve all input connectors
const inputConnectors = await agent.getInputConnectors();
console.log(inputConnectors);
```

This documentation provides a comprehensive overview of the `PsAgent` class, including its properties, methods, and an example of how to use it.