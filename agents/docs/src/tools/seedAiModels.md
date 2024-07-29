# Seed AI Models Script

This script is used to seed AI models and create a top-level agent class in the database. It connects to the database, initializes models, creates a user, configures AI models, and sets up a group with AI model API keys. Finally, it creates a top-level agent class.

## Example Usage

```typescript
import { initializeModels, models } from "../dbModels/index.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAgentClassCategories } from "../agentCategories.js";

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
  category: PsAgentClassCategories.PolicySynthTopLevel,
  subCategory: "group",
  hasPublicAccess: true,
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

## Classes and Interfaces

### PsAiModelConfiguration

Configuration for an AI model.

| Name                  | Type   | Description                                      |
|-----------------------|--------|--------------------------------------------------|
| type                  | string | The type of AI model (e.g., Text).               |
| modelSize             | string | The size of the AI model (e.g., Medium).         |
| provider              | string | The provider of the AI model (e.g., "anthropic").|
| prices                | object | Pricing details for the AI model.                |
| maxTokensOut          | number | Maximum tokens output by the model.              |
| defaultTemperature    | number | Default temperature setting for the model.       |
| model                 | string | The model identifier.                            |
| active                | boolean| Whether the model is active.                     |

### PsAgentClassAttributesConfiguration

Configuration for an agent class.

| Name                  | Type   | Description                                      |
|-----------------------|--------|--------------------------------------------------|
| category              | string | The category of the agent class.                 |
| subCategory           | string | The sub-category of the agent class.             |
| hasPublicAccess       | boolean| Whether the agent class has public access.       |
| description           | string | Description of the agent class.                  |
| queueName             | string | Queue name for the agent class.                  |
| imageUrl              | string | URL of the image representing the agent class.   |
| iconName              | string | Icon name for the agent class.                   |
| capabilities          | array  | Capabilities of the agent class.                 |
| questions             | array  | Structured questions for the agent class.        |
| requestedAiModelSizes | array  | Requested AI model sizes.                        |
| supportedConnectors   | array  | Supported connectors for the agent class.        |

### PsAiModel

Represents an AI model in the database.

| Name           | Type   | Description                                      |
|----------------|--------|--------------------------------------------------|
| name           | string | The name of the AI model.                        |
| organization_id| number | The ID of the organization owning the model.     |
| user_id        | number | The ID of the user who created the model.        |
| configuration  | object | Configuration details for the AI model.          |

### PsAgentClass

Represents an agent class in the database.

| Name           | Type   | Description                                      |
|----------------|--------|--------------------------------------------------|
| class_base_id  | string | The base ID of the agent class.                  |
| name           | string | The name of the agent class.                     |
| version        | number | The version of the agent class.                  |
| available      | boolean| Whether the agent class is available.            |
| configuration  | object | Configuration details for the agent class.       |
| user_id        | number | The ID of the user who created the agent class.  |

### Group

Represents a group in the database.

| Name                        | Type   | Description                                      |
|-----------------------------|--------|--------------------------------------------------|
| name                        | string | The name of the group.                           |
| user_id                     | number | The ID of the user who created the group.        |
| configuration               | object | Configuration details for the group.             |
| private_access_configuration| array  | Private access configuration for the group.      |

### User

Represents a user in the database.

| Name   | Type   | Description                                      |
|--------|--------|--------------------------------------------------|
| email  | string | The email of the user.                           |
| name   | string | The name of the user.                            |

## Methods

### connectToDatabase

Connects to the database.

```typescript
await connectToDatabase();
```

### initializeModels

Initializes the models.

```typescript
await initializeModels();
```

### User.create

Creates a new user.

```typescript
const user = await User.create({ email: "example@example.com", name: "Example User" });
```

### PsAiModel.create

Creates a new AI model.

```typescript
const anthropicSonnet = await PsAiModel.create({
  name: "Anthropic Sonnet 3.5",
  organization_id: 1,
  user_id: user.id,
  configuration: anthropicSonnetConfig,
});
```

### Group.create

Creates a new group.

```typescript
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
```

### PsAgentClass.create

Creates a new agent class.

```typescript
await PsAgentClass.create({
  class_base_id: "c375c1fb-58ca-4372-a567-0e02b2c3d479",
  name: "Operations",
  version: 1,
  available: true,
  configuration: topLevelAgentClassConfig,
  user_id: user.id,
});
```

This script provides a comprehensive example of how to seed AI models and create a top-level agent class in the database. It includes detailed configurations for AI models and agent classes, ensuring that the setup is complete and ready for use.