# Seed Database Script

This script is used to seed the database with initial data, including users, AI models, groups, and agents. It demonstrates how to create and associate various entities using the provided models.

## Properties

| Name                        | Type                        | Description                                                                 |
|-----------------------------|-----------------------------|-----------------------------------------------------------------------------|
| user                        | `User`                      | The user entity created in the database.                                    |
| anthropicSonnetConfig       | `PsAiModelConfiguration`    | Configuration for the Anthropic Sonnet AI model.                            |
| anthropicSonnet             | `PsAiModel`                 | The Anthropic Sonnet AI model created in the database.                      |
| openAiGpt4oConfig           | `PsAiModelConfiguration`    | Configuration for the OpenAI GPT-4o AI model.                               |
| openAiGpt4oMiniConfig       | `PsAiModelConfiguration`    | Configuration for the OpenAI GPT-4o Mini AI model.                          |
| openAiGpt4                  | `PsAiModel`                 | The OpenAI GPT-4o AI model created in the database.                         |
| openAiGpt4Mini              | `PsAiModel`                 | The OpenAI GPT-4o Mini AI model created in the database.                    |
| topLevelAgentClassConfig    | `PsAgentClassAttributesConfiguration` | Configuration for the top-level agent class.                                |
| problemsAgentClassInstance  | `PsAgentClass`              | The existing Problems Agent Class fetched from the database.                |
| topLevelAgentClassInstance  | `PsAgentClass`              | The top-level agent class created in the database.                          |
| topLevelAgentInstance       | `PsAgent`                   | The top-level agent instance created in the database.                       |
| subAgentInstance            | `PsAgent`                   | The sub-agent instance created in the database.                             |

## Methods

| Name                        | Parameters        | Return Type | Description                                                                 |
|-----------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| connectToDatabase           | None              | `Promise<void>` | Connects to the database.                                                   |
| initializeModels            | None              | `Promise<void>` | Initializes the database models.                                            |
| User.create                 | `user: object`    | `Promise<User>` | Creates a new user in the database.                                         |
| PsAiModel.create            | `model: object`   | `Promise<PsAiModel>` | Creates a new AI model in the database.                                     |
| Group.create                | `group: object`   | `Promise<Group>` | Creates a new group in the database.                                        |
| PsAgentClass.findByPk       | `id: number`      | `Promise<PsAgentClass>` | Fetches an agent class by primary key.                                      |
| PsAgentClass.create         | `agentClass: object` | `Promise<PsAgentClass>` | Creates a new agent class in the database.                                  |
| PsAgent.create              | `agent: object`   | `Promise<PsAgent>` | Creates a new agent in the database.                                        |
| topLevelAgentInstance.addSubAgents | `agents: PsAgent[]` | `Promise<void>` | Adds sub-agents to the top-level agent.                                     |
| topLevelAgentInstance.addAiModel | `model: PsAiModel` | `Promise<void>` | Associates an AI model with the top-level agent.                            |
| subAgentInstance.addAiModel | `model: PsAiModel` | `Promise<void>` | Associates an AI model with the sub-agent.                                  |

## Example

```typescript
import { initializeModels, models } from "../dbModels/index.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAgentConnector } from "../dbModels/agentConnector.js";
import { PsAgent } from "../dbModels/agent.js";
import { PsExternalApiUsage } from "../dbModels/externalApiUsage.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAgentAuditLog } from "../dbModels/agentAuditLog.js";
import { PsAgentRegistry } from "../dbModels/agentRegistry.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { PsExternalApi } from "../dbModels/externalApis.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";

await connectToDatabase();
await initializeModels();

// Create a user
const user = await User.create({ email: "user@example.com", name: "Example User" });

const anthropicSonnetConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Medium,
  provider: "anthropic",
  prices: {
    costInTokensPerMillion: 3,
    costOutTokensPerMillion: 15,
    currency: "USD"
  },
  maxTokensOut: 4096,
  defaultTemperature: 0.7,
  model: "claude-3-5-sonnet-20240620",
  active: true
};

const anthropicSonnet = await PsAiModel.create({
  name: "Anthropic Sonnet 3.5",
  organization_id: 1,
  user_id: user.id,
  configuration: anthropicSonnetConfig,
});

const openAiGpt4oConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Medium,
  provider: "openai",
  prices: {
    costInTokensPerMillion: 5,
    costOutTokensPerMillion: 15,
    currency: "USD"
  },
  maxTokensOut: 4096,
  defaultTemperature: 0.7,
  model: "gpt-4o",
  active: true
};

const openAiGpt4oMiniConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  provider: "openai",
  prices: {
    costInTokensPerMillion: 0.15,
    costOutTokensPerMillion: 0.6,
    currency: "USD"
  },
  maxTokensOut: 16000,
  defaultTemperature: 0.0,
  model: "gpt-4o mini",
  active: true
};

const openAiGpt4 = await PsAiModel.create({
  name: "GPT-4o",
  organization_id: 1,
  user_id: user.id,
  configuration: openAiGpt4oConfig,
});

const openAiGpt4Mini = await PsAiModel.create({
  name: "GPT-4o Mini",
  organization_id: 1,
  user_id: user.id,
  configuration: openAiGpt4oMiniConfig,
});

// Create a group with both AI model API keys
await Group.create({
  name: "Example Group",
  user_id: user.id,
  private_access_configuration: [
    {
      aiModelId: anthropicSonnet.id,
      apiKey: process.env.ANTHROPIC_CLAUDE_SONNET_API_KEY || "",
    },
    {
      aiModelId: openAiGpt4.id,
      apiKey: process.env.OPENAI_API_KEY || "",
    },
    {
      aiModelId: openAiGpt4Mini.id,
      apiKey: process.env.OPENAI_API_KEY || "",
    },
  ]
});

// Create Top-Level Agent Class
const topLevelAgentClassConfig: PsAgentClassAttributesConfiguration = {
  description: "A top-level agent that coordinates other agents",
  queueName: "noqueue",
  imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png",
  iconName: "coordinator",
  capabilities: ["process coordination", "task management", "result aggregation"],
  requestedAiModelSizes: ["large", "medium", "small"] as PsAiModelSize[],
  supportedConnectors: [],
  questions: []
};

// Fetch the existing Problems Agent Class
const problemsAgentClassInstance = await PsAgentClass.findByPk(1);

if (!problemsAgentClassInstance) {
  throw new Error("Problems Agent Class not found with id 1");
}

const topLevelAgentClassInstance = await PsAgentClass.create({
  class_base_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  name: "Smarter Crowdsourcing Coordinator Agent",
  version: 1,
  available: true,
  configuration: topLevelAgentClassConfig,
  user_id: user.id,
});

// Create Agents
const topLevelAgentInstance = await PsAgent.create({
  class_id: topLevelAgentClassInstance.id,
  user_id: user.id,
  group_id: 1,
  configuration: {
    name: "Smarter Crowdsourcing Coordinator",
    graphPosX: 0,
    graphPosY: 0,
  },
});

const subAgentInstance = await PsAgent.create({
  class_id: 1, // Using the existing Problems Agent Class with id 1
  user_id: user.id,
  group_id: 1,
  configuration: {
    name: "Root Causes Agent",
    graphPosX: 0,
    graphPosY: 100,
  },
  parent_agent_id: topLevelAgentInstance.id,
});

// Add sub-agent to the top-level agent
await topLevelAgentInstance.addSubAgents([subAgentInstance]);

// Associate both AI models with all agents
//await topLevelAgentInstance.addAiModel(anthropicSonnet);
await topLevelAgentInstance.addAiModel(openAiGpt4);
//await subAgentInstance.addAiModel(anthropicSonnet);
await subAgentInstance.addAiModel(openAiGpt4);

console.log("Database seeded successfully!");
```