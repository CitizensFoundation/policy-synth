# Seed AI Models Script

This script is used to initialize and seed AI models and agent classes in the database. It connects to the database, creates user and group records, and sets up AI models and agent classes with specific configurations.

## Properties

| Name                        | Type                        | Description                                                                 |
|-----------------------------|-----------------------------|-----------------------------------------------------------------------------|
| `user`                      | `User`                      | The user object created in the database.                                    |
| `anthropicSonnetConfig`     | `PsAiModelConfiguration`    | Configuration for the Anthropic Sonnet AI model.                            |
| `anthropicSonnet`           | `PsAiModel`                 | The Anthropic Sonnet AI model created in the database.                      |
| `openAiGpt4oConfig`         | `PsAiModelConfiguration`    | Configuration for the OpenAI GPT-4o AI model.                               |
| `openAiGpt4oMiniConfig`     | `PsAiModelConfiguration`    | Configuration for the OpenAI GPT-4o Mini AI model.                          |
| `openAiGpt4`                | `PsAiModel`                 | The OpenAI GPT-4o AI model created in the database.                         |
| `openAiGpt4Mini`            | `PsAiModel`                 | The OpenAI GPT-4o Mini AI model created in the database.                    |
| `topLevelAgentClassConfig`  | `PsAgentClassAttributesConfiguration` | Configuration for the top-level agent class.                                |

## Methods

| Name                   | Parameters        | Return Type | Description                                                                 |
|------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| `connectToDatabase`    | None              | `Promise<void>` | Connects to the database.                                                   |
| `initializeModels`     | None              | `Promise<void>` | Initializes the database models.                                            |
| `User.create`          | `user: object`    | `Promise<User>` | Creates a new user in the database.                                         |
| `PsAiModel.create`     | `model: object`   | `Promise<PsAiModel>` | Creates a new AI model in the database.                                     |
| `Group.create`         | `group: object`   | `Promise<Group>` | Creates a new group in the database.                                        |
| `PsAgentClass.create`  | `agentClass: object` | `Promise<PsAgentClass>` | Creates a new agent class in the database.                                  |

## Example

```typescript
import { initializeModels, models } from "../dbModels/index.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";

await connectToDatabase();
await initializeModels();

const user = await User.create({ email: "example@example.com", name: "Example User" });

const anthropicSonnetConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Medium,
  provider: "anthropic",
  prices: {
    costInTokensPerMillion: 3,
    costOutTokensPerMillion: 15,
    currency: "USD"
  },
  maxTokensOut: 8000,
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
  model: "gpt-4o-mini",
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
  configuration: {
    agents: {
    }
  },
  private_access_configuration: [
    {
      aiModelId: anthropicSonnet.id,
      apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY || "",
    },
    {
      aiModelId: openAiGpt4.id,
      apiKey: process.env.OPENAI_API_KEY || "",
    },
    {
      aiModelId: openAiGpt4Mini.id,
      apiKey: process.env.OPENAI_API_KEY || "",
    }
  ]
});

// Create Top-Level Agent Class
const topLevelAgentClassConfig: PsAgentClassAttributesConfiguration = {
  description: "A top-level agent that coordinates other agents",
  queueName: "noqueue",
  imageUrl: "https://yrpri-eu-direct-assets.s3.eu-west-1.amazonaws.com/topLevelAgent.png",
  iconName: "coordinator",
  capabilities: ["process coordination", "task management", "result aggregation"],
  questions: [],
  requestedAiModelSizes: ["large", "medium", "small"] as PsAiModelSize[],
  supportedConnectors: [],
};

await PsAgentClass.create({
  class_base_id: "c375c1fb-58ca-4372-a567-0e02b2c3d479",
  name: "Operations",
  version: 1,
  available: true,
  configuration: topLevelAgentClassConfig,
  user_id: user.id,
});
```

This script demonstrates how to set up and seed AI models and agent classes in the database using the provided configurations. It includes creating a user, setting up AI models with specific configurations, creating a group with AI model API keys, and creating a top-level agent class.