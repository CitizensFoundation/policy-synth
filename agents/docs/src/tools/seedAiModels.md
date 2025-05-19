# seedAiModels.js

This script seeds the database with example AI models, a user, a group, and a top-level agent class for the PolicySynth Agents system. It is intended to be run as a one-time setup or for development/testing purposes.

## Overview

- Connects to the database and initializes models.
- Creates a user.
- Creates several AI model configurations (Anthropic Sonnet, OpenAI GPT-4o, GPT-4o Mini).
- Creates a group with private access configurations for the AI models and their API keys.
- Creates a top-level agent class for coordinating other agents.

## Example Path

`@policysynth/agents/tools/seedAiModels.js`

---

## Main Steps

### 1. Database Initialization

```typescript
await connectToDatabase();
await initializeModels();
```
Connects to the database and initializes all Sequelize models.

---

### 2. User Creation

```typescript
const user = await User.create({ email: "example@example.com", name: "Example User" });
```
Creates a new user with the specified email and name.

---

### 3. AI Model Configurations

#### a. Anthropic Sonnet 3.5

```typescript
const anthropicSonnetConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Medium,
  provider: "anthropic",
  prices: {
    costInTokensPerMillion: 3,
    costOutTokensPerMillion: 15,
    costInCachedContextTokensPerMillion: 1.5,
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
```

#### b. OpenAI GPT-4o

```typescript
const openAiGpt4oConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Medium,
  provider: "openai",
  prices: {
    costInTokensPerMillion: 5,
    costOutTokensPerMillion: 15,
    costInCachedContextTokensPerMillion: 2.5,
    currency: "USD"
  },
  maxTokensOut: 4096,
  defaultTemperature: 0.7,
  model: "gpt-4o",
  active: true
};

const openAiGpt4 = await PsAiModel.create({
  name: "GPT-4o",
  organization_id: 1,
  user_id: user.id,
  configuration: openAiGpt4oConfig,
});
```

#### c. OpenAI GPT-4o Mini

```typescript
const openAiGpt4oMiniConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  provider: "openai",
  prices: {
    costInTokensPerMillion: 0.15,
    costOutTokensPerMillion: 0.6,
    costInCachedContextTokensPerMillion: 0.075,
    currency: "USD"
  },
  maxTokensOut: 16000,
  defaultTemperature: 0.0,
  model: "gpt-4o-mini",
  active: true
};

const openAiGpt4Mini = await PsAiModel.create({
  name: "GPT-4o Mini",
  organization_id: 1,
  user_id: user.id,
  configuration: openAiGpt4oMiniConfig,
});
```

---

### 4. Group Creation with AI Model API Keys

```typescript
await Group.create({
  name: "Example Group",
  user_id: user.id,
  configuration: {
    agents: {}
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
Creates a group and associates it with the created AI models and their API keys for private access.

---

### 5. Top-Level Agent Class Creation

```typescript
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
Creates a top-level agent class for coordinating other agents, with public access and support for multiple AI model sizes.

---

## Types Used

### PsAiModelConfiguration

| Name                                | Type      | Description                                      |
|------------------------------------- |-----------|--------------------------------------------------|
| type                                | string    | The type of AI model (e.g., "text").             |
| modelSize                           | string    | The size of the model (e.g., "medium", "small"). |
| provider                            | string    | The provider name (e.g., "openai", "anthropic"). |
| prices                              | object    | Pricing details for the model.                   |
| maxTokensOut                        | number    | Maximum output tokens.                           |
| defaultTemperature                  | number    | Default temperature for model responses.         |
| model                               | string    | Model identifier string.                         |
| active                              | boolean   | Whether the model is active.                     |

### YpGroupPrivateAccessConfiguration

| Name         | Type    | Description                                 |
|--------------|---------|---------------------------------------------|
| aiModelId    | number  | ID of the AI model for this access config.  |
| apiKey       | string  | API key for the AI model.                   |
| externalApiId| number  | (optional) ID of an external API.           |
| projectId    | string  | (optional) Project ID.                      |

### PsAgentClassAttributesConfiguration

| Name                  | Type      | Description                                               |
|-----------------------|-----------|-----------------------------------------------------------|
| category              | string    | Agent class category.                                     |
| subCategory           | string    | Sub-category for the agent class.                         |
| hasPublicAccess       | boolean   | Whether the agent class is public.                        |
| description           | string    | Description of the agent class.                           |
| queueName             | string    | Name of the queue for the agent.                          |
| imageUrl              | string    | URL to the agent class image.                             |
| iconName              | string    | Icon name for the agent class.                            |
| capabilities          | string[]  | List of agent capabilities.                               |
| questions             | array     | Structured questions for agent configuration.             |
| requestedAiModelSizes | string[]  | Supported AI model sizes.                                 |
| supportedConnectors   | array     | Supported connectors for the agent class.                 |

---

## Example Usage

```typescript
// Run this script to seed the database with example AI models, a user, a group, and a top-level agent class.
node @policysynth/agents/tools/seedAiModels.js
```

---

## Environment Variables

- `ANTHROPIC_CLAUDE_API_KEY` — API key for Anthropic Claude model.
- `OPENAI_API_KEY` — API key for OpenAI models.

---

## Notes

- This script is intended for development or initial setup. Do not run in production unless you intend to overwrite or add these records.
- The script assumes the existence of the referenced models and their methods.
- The group created will have access to the seeded AI models via the provided API keys.

---