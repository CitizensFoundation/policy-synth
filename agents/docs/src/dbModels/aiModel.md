# PsAiModel

Represents an AI model configuration within the PolicySynth Agents system. This Sequelize model maps to the `ps_ai_models` table and stores metadata and configuration for AI models that can be associated with agents.

## Properties

| Name             | Type                     | Description                                                                 |
|------------------|--------------------------|-----------------------------------------------------------------------------|
| id               | number                   | Primary key. Auto-incremented integer identifier.                           |
| uuid             | string                   | Universally unique identifier (UUID v4) for the model.                      |
| user_id          | number                   | ID of the user who created or owns this AI model.                           |
| organization_id  | number                   | ID of the organization this AI model belongs to.                            |
| created_at       | Date                     | Timestamp when the model was created.                                       |
| updated_at       | Date                     | Timestamp when the model was last updated.                                  |
| name             | string                   | Human-readable name for the AI model.                                       |
| configuration    | PsAiModelConfiguration   | JSON object containing the model's configuration (type, provider, pricing, etc). |

## Sequelize Model Options

- **Table Name:** `ps_ai_models`
- **Indexes:**
  - Unique index on `uuid`
  - Index on `user_id`
  - Index on `organization_id`
- **Timestamps:** Enabled (`created_at`, `updated_at`)
- **Underscored:** Enabled (snake_case column names)

## Associations

| Association         | Type         | Related Model | Description                                                                 |
|---------------------|--------------|--------------|-----------------------------------------------------------------------------|
| Agents              | Many-to-Many | PsAgent      | Associates AI models with agents via the `AgentModels` join table.          |

- **through:** `AgentModels`
- **foreignKey:** `ai_model_id`
- **otherKey:** `agent_id`
- **as:** `Agents`
- **timestamps:** false

## Example

```typescript
import { PsAiModel } from '@policysynth/agents/dbModels/aiModel.js';

// Creating a new AI model
const newModel = await PsAiModel.create({
  user_id: 1,
  organization_id: 2,
  name: "OpenAI GPT-4 Large",
  configuration: {
    type: "openai",
    modelSize: "large",
    model: "gpt-4",
    provider: "openai",
    active: true,
    prices: {
      costInTokensPerMillion: 30,
      costOutTokensPerMillion: 60,
      costInCachedContextTokensPerMillion: 10,
      currency: "USD"
    },
    maxTokensOut: 4096,
    defaultTemperature: 0.7
  }
});

// Fetching all agents using a specific AI model
const modelWithAgents = await PsAiModel.findOne({
  where: { id: 1 },
  include: [{ association: 'Agents' }]
});
```

---

**File:** `@policysynth/agents/dbModels/aiModel.js`