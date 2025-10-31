# addNewAiModel.js

A command-line utility script for adding a new AI model configuration to the PolicySynth database. This script deactivates any existing models with the same name before creating a new model entry, ensuring only one active configuration per model name.

---

## Functions

### deactivateExistingModels

Deactivates all existing AI models in the database with the specified name by setting their `active` flag to `false` in the configuration.

| Parameter | Type     | Description                        |
|-----------|----------|------------------------------------|
| name      | string   | The name of the AI model to search for and deactivate. |

**Returns:** `Promise<void>`

---

### addAiModel

Adds a new AI model configuration to the database. If a model with the same name exists, it is first deactivated. The function logs the result of the operation.

| Parameter                        | Type                | Description                                                      |
|-----------------------------------|---------------------|------------------------------------------------------------------|
| name                             | string              | The name of the AI model.                                        |
| organizationId                   | number              | The organization ID to associate with the model.                 |
| userId                           | number              | The user ID of the creator.                                      |
| type                             | PsAiModelType       | The type of the AI model (see `PsAiModelType`).                  |
| modelSize                        | PsAiModelSize       | The size of the AI model (see `PsAiModelSize`).                  |
| provider                         | string              | The provider of the AI model (e.g., "openai", "azure").          |
| costInTokensPerMillion           | number              | Cost per million input tokens.                                   |
| costOutTokensPerMillion          | number              | Cost per million output tokens.                                  |
| costInCachedContextTokensPerMillion | number           | Cost per million cached context tokens.                          |
| currency                         | string              | The currency for the costs (e.g., "USD").                        |
| maxTokensOut                     | number              | Maximum output tokens allowed for the model.                     |
| defaultTemperature               | number              | Default temperature setting for the model.                       |
| model                            | string              | The model identifier (e.g., "gpt-4-turbo").                      |
| active                           | boolean             | Whether the model should be active.                              |

**Returns:** `Promise<void>`

---

## Command-Line Usage

This script is intended to be run via the command line using `ts-node` or `node` (after compilation). It expects **13 arguments** in the following order:

```
ts-node addNewAiModel.js <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <costInCachedContextTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>
```

- `<name>`: Name of the AI model (string)
- `<organizationId>`: Organization ID (number)
- `<userId>`: User ID (number)
- `<type>`: AI model type (must match a value in `PsAiModelType`)
- `<modelSize>`: AI model size (must match a value in `PsAiModelSize`)
- `<provider>`: Provider name (string)
- `<costInTokensPerMillion>`: Cost per million input tokens (number)
- `<costOutTokensPerMillion>`: Cost per million output tokens (number)
- `<costInCachedContextTokensPerMillion>`: Cost per million cached context tokens (number)
- `<currency>`: Currency code (string)
- `<maxTokensOut>`: Maximum output tokens (number)
- `<defaultTemperature>`: Default temperature (number)
- `<model>`: Model identifier (string)
- `<active>`: Whether the model is active ("true" or "false")

If the arguments are invalid or missing, the script will log an error and exit.

---

## Example

```bash
ts-node @policysynth/agents/tools/addNewAiModel.js \
  "gpt-4-turbo" \
  1 \
  1 \
  "chat" \
  "large" \
  "openai" \
  100 \
  200 \
  50 \
  "USD" \
  4096 \
  0.7 \
  "gpt-4-turbo" \
  true
```

---

## Example Code Usage

```typescript
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";

// Example: Add a new AI model programmatically
addAiModel(
  "gpt-4-turbo",
  1, // organizationId
  1, // userId
  PsAiModelType.chat,
  PsAiModelSize.large,
  "openai",
  100, // costInTokensPerMillion
  200, // costOutTokensPerMillion
  50,  // costInCachedContextTokensPerMillion
  "USD",
  4096, // maxTokensOut
  0.7,  // defaultTemperature
  "gpt-4-turbo",
  true  // active
);
```

---

## Notes

- The script ensures only one active model per name by deactivating existing models before adding a new one.
- The model configuration is stored in the `configuration` field of the `PsAiModel` database model.
- Logging is handled via `PolicySynthAgentBase.logger`.
- Argument validation is performed for model type and size.

---

## Related Types

- **PsAiModelType**: Enum of supported AI model types (e.g., "chat", "completion").
- **PsAiModelSize**: Enum of supported model sizes (e.g., "small", "medium", "large").
- **PsAiModelConfiguration**: Configuration object for an AI model, including pricing and operational parameters.

---

## File Location

`@policysynth/agents/tools/addNewAiModel.js`