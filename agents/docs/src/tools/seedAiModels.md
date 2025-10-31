# seedAiModels.js

This script seeds the PolicySynth database with example AI models and a top-level agent class, and demonstrates how to associate API keys with a group for model access. It is intended for use in initializing a PolicySynth instance with default AI models and agent classes.

## Overview

- Connects to the database and initializes models.
- Creates a user.
- Defines and creates several AI model configurations (Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, OpenAI GPT-4o Mini).
- Creates a group and associates it with the created AI models and their API keys.
- Defines and creates a top-level agent class for coordinating other agents.

## Example Path

`@policysynth/agents/tools/seedAiModels.js`

---

## Main Script Logic

### 1. Database Initialization

Connects to the database and initializes all models.

```typescript
await connectToDatabase();
await initializeModels();
```

### 2. User Creation

Creates a new user for associating with models and agent classes.

```typescript
const user = await User.create({ email: "example@example.com", name: "Example User" });
```

### 3. AI Model Configuration and Creation

#### Anthropic Claude 3.5 Sonnet

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

#### OpenAI GPT-4o

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

#### OpenAI GPT-4o Mini

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

### 4. Group Creation with AI Model API Keys

Creates a group and associates it with the created AI models and their API keys using the `private_access_configuration` property.

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

### 5. Top-Level Agent Class Creation

Defines and creates a top-level agent class for coordinating other agents.

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

---

## Example

```typescript
import { initializeModels, models } from "../dbModels/index.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAgentClassCategories } from "../agentCategories.js";

// Connect and initialize
await connectToDatabase();
await initializeModels();

// Create user
const user = await User.create({ email: "example@example.com", name: "Example User" });

// Define and create AI models
const anthropicSonnet = await PsAiModel.create({ ... });
const openAiGpt4 = await PsAiModel.create({ ... });
const openAiGpt4Mini = await PsAiModel.create({ ... });

// Create group with model API keys
await Group.create({
  name: "Example Group",
  user_id: user.id,
  configuration: { agents: {} },
  private_access_configuration: [
    { aiModelId: anthropicSonnet.id, apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY || "" },
    { aiModelId: openAiGpt4.id, apiKey: process.env.OPENAI_API_KEY || "" },
    { aiModelId: openAiGpt4Mini.id, apiKey: process.env.OPENAI_API_KEY || "" }
  ]
});

// Create top-level agent class
await PsAgentClass.create({
  class_base_id: "c375c1fb-58ca-4372-a567-0e02b2c3d479",
  name: "Operations",
  version: 1,
  available: true,
  configuration: {
    category: PsAgentClassCategories.PolicySynthTopLevel,
    subCategory: "group",
    hasPublicAccess: true,
    description: "A top-level agent that coordinates other agents",
    queueName: "noqueue",
    imageUrl: "...",
    iconName: "coordinator",
    capabilities: ["process coordination", "task management", "result aggregation"],
    questions: [],
    requestedAiModelSizes: ["large", "medium", "small"],
    supportedConnectors: [],
  },
  user_id: user.id,
});
```

---

## Types Used

- **PsAiModelConfiguration**: Configuration for an AI model, including type, size, provider, pricing, and other parameters.
- **YpGroupPrivateAccessConfiguration**: Associates an AI model with an API key for group-level access.
- **PsAgentClassAttributesConfiguration**: Configuration for an agent class, including category, description, capabilities, and supported model sizes.

---

## Usage

Run this script to seed your PolicySynth database with default AI models and a top-level agent class. This is typically done as part of the initial setup or for testing purposes.

---

**File:** `@policysynth/agents/tools/seedAiModels.js`