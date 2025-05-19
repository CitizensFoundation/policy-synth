# AgentModels

Represents the join table between agents and AI models, establishing a many-to-many relationship between the `ps_agents` and `ps_ai_models` tables. Each record links a specific agent to a specific AI model.

**File:** `@policysynth/agents/dbModels/agentModel.js`

## Properties

| Name        | Type   | Description                                                                                 |
|-------------|--------|---------------------------------------------------------------------------------------------|
| agent_id    | number | The ID of the agent. References the `id` field in the `ps_agents` table.                    |
| ai_model_id | number | The ID of the AI model. References the `id` field in the `ps_ai_models` table.              |

## Sequelize Model Details

- **Table Name:** `AgentModels`
- **Primary Key:** Composite of `agent_id` and `ai_model_id`
- **Timestamps:** Disabled (no `created_at` or `updated_at`)
- **Indexes:** On `agent_id` and `ai_model_id`
- **Foreign Keys:**
  - `agent_id` → `ps_agents.id` (CASCADE on delete)
  - `ai_model_id` → `ps_ai_models.id` (CASCADE on delete)

## Example

```typescript
import { AgentModels } from '@policysynth/agents/dbModels/agentModel.js';

// Creating a new association between an agent and an AI model
await AgentModels.create({
  agent_id: 42,
  ai_model_id: 7,
});

// Querying all AI models associated with a specific agent
const agentModels = await AgentModels.findAll({ where: { agent_id: 42 } });

// Removing an association (will cascade on delete)
await AgentModels.destroy({ where: { agent_id: 42, ai_model_id: 7 } });
```

## Usage Notes

- This model does **not** auto-generate IDs or timestamps.
- Both `agent_id` and `ai_model_id` are required and together form the composite primary key.
- Deleting an agent or AI model will automatically remove the corresponding associations due to `CASCADE` on delete.
- Used internally to manage which AI models are available to which agents.