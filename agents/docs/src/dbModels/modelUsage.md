# PsModelUsage

Represents the usage statistics and token accounting for AI models within the PolicySynth Agents system. This model tracks the number of tokens processed (input, output, cached, long context, etc.) for each model usage event, and associates usage with users, agents, and connectors.

Defined in: [`@policysynth/agents/dbModels/modelUsage.js`](./modelUsage.js)

## Properties

| Name                                 | Type      | Description                                                                                 |
|-------------------------------------- |-----------|---------------------------------------------------------------------------------------------|
| id                                   | number    | Unique identifier for the model usage record.                                               |
| user_id                              | number    | ID of the user associated with this usage record.                                           |
| created_at                           | Date      | Timestamp when the usage record was created.                                                |
| updated_at                           | Date      | Timestamp when the usage record was last updated.                                           |
| model_id                             | number    | ID of the AI model used.                                                                    |
| token_in_count                       | number    | Number of input tokens processed (standard context).                                        |
| token_in_cached_context_count         | number    | Number of input tokens processed from cached context.                                       |
| long_context_token_in_count           | number    | Number of input tokens processed in long context.                                           |
| long_context_token_in_cached_context_count | number | Number of input tokens from cached context in long context.                                 |
| token_out_count                      | number    | Number of output tokens generated (standard context).                                       |
| token_out_reasoning_count             | number    | Number of output tokens generated for reasoning.                                            |
| token_out_audio_count                 | number    | Number of output tokens generated for audio.                                                |
| token_out_image_count                 | number    | Number of output tokens generated for images.                                               |
| long_context_token_out_count          | number    | Number of output tokens generated in long context.                                          |
| long_context_token_out_reasoning_count| number    | Number of output tokens for reasoning in long context.                                      |
| long_context_token_out_audio_count    | number    | Number of output tokens for audio in long context.                                          |
| long_context_token_out_image_count    | number    | Number of output tokens for images in long context.                                         |
| agent_id                             | number    | (Optional) ID of the agent associated with this usage.                                      |
| connector_id                         | number    | (Optional) ID of the connector associated with this usage.                                  |

## Example

```typescript
import { PsModelUsage } from '@policysynth/agents/dbModels/modelUsage.js';

// Creating a new model usage record
const usage = await PsModelUsage.create({
  user_id: 42,
  model_id: 3,
  token_in_count: 1000,
  token_out_count: 800,
  token_in_cached_context_count: 200,
  long_context_token_in_count: 0,
  long_context_token_in_cached_context_count: 0,
  token_out_reasoning_count: 100,
  token_out_audio_count: 0,
  token_out_image_count: 0,
  long_context_token_out_count: 0,
  long_context_token_out_reasoning_count: 0,
  long_context_token_out_audio_count: 0,
  long_context_token_out_image_count: 0,
  agent_id: 7,
  connector_id: null,
});

// Querying usage by model
const usages = await PsModelUsage.findAll({ where: { model_id: 3 } });
```

## Sequelize Table Definition

- **Table name:** `ps_model_usage`
- **Indexes:** `user_id`, `model_id`, `agent_id`, `connector_id`
- **Timestamps:** `created_at`, `updated_at`
- **Naming:** Uses underscored column names (e.g., `token_in_count`)

---

This model is essential for tracking and analyzing the cost and performance of AI model usage across users, agents, and connectors in the PolicySynth platform.