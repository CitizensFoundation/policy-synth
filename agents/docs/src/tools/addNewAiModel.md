# addNewAiModel.js

A command-line utility script for adding a new AI model configuration to the database in the PolicySynth Agents system. This script ensures that only one active model with a given name exists by deactivating any existing models with the same name before creating a new one.

## Functions

### deactivateExistingModels

Deactivates all existing AI models in the database with the specified name by setting their `active` flag to `false` in the configuration.

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| name      | string | The name of the AI model to search for and deactivate. |

**Returns:** `Promise<void>`

---

### addAiModel

Adds a new AI model configuration to the database. Before adding, it deactivates any existing models with the same name. The function expects all model configuration parameters and creates a new entry in the `ps_ai_models` table.

| Parameter                           | Type                | Description                                                                 |
|--------------------------------------|---------------------|-----------------------------------------------------------------------------|
| name                                | string              | Name of the AI model.                                                       |
| organizationId                      | number              | Organization ID to associate the model with.                                |
| userId                              | number              | User ID of the creator.                                                     |
| type                                | PsAiModelType       | Type of the AI model (e.g., "openai", "anthropic").                         |
| modelSize                           | PsAiModelSize       | Size of the model (e.g., "small", "medium", "large").                       |
| provider                            | string              | Provider name (e.g., "openai", "azure").                                    |
| costInTokensPerMillion              | number              | Cost per million input tokens.                                              |
| costOutTokensPerMillion             | number              | Cost per million output tokens.                                             |
| costInCachedContextTokensPerMillion  | number              | Cost per million cached context tokens.                                     |
| currency                            | string              | Currency code (e.g., "USD").                                                |
| maxTokensOut                        | number              | Maximum number of output tokens allowed.                                    |
| defaultTemperature                  | number              | Default temperature for the model.                                          |
| model                               | string              | Model identifier (e.g., "gpt-4", "claude-3").                               |
| active                              | boolean             | Whether the model should be active.                                         |

**Returns:** `Promise<void>`

---

## Command-Line Usage

This script is intended to be run from the command line using `ts-node` or `node` (after compilation). It expects **13 arguments** in the following order:

```
ts-node @policysynth/agents/tools/addNewAiModel.js <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <costInCachedContextTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>
```

- `<name>`: Name of the AI model.
- `<organizationId>`: Organization ID (number).
- `<userId>`: User ID (number).
- `<type>`: AI model type (must match a value from `PsAiModelType`).
- `<modelSize>`: Model size (must match a value from `PsAiModelSize`).
- `<provider>`: Provider name.
- `<costInTokensPerMillion>`: Cost per million input tokens (number).
- `<costOutTokensPerMillion>`: Cost per million output tokens (number).
- `<costInCachedContextTokensPerMillion>`: Cost per million cached context tokens (number).
- `<currency>`: Currency code (e.g., "USD").
- `<maxTokensOut>`: Maximum output tokens (number).
- `<defaultTemperature>`: Default temperature (number).
- `<model>`: Model identifier.
- `<active>`: "true" or "false" (whether the model is active).

**Example:**

```bash
ts-node @policysynth/agents/tools/addNewAiModel.js "gpt-4" 1 1 "openai" "large" "openai" 3000 6000 1000 "USD" 4096 0.7 "gpt-4" true
```

## Example

```typescript
// Example usage from the command line
// (Assuming you have ts-node installed and are in the correct directory)

ts-node @policysynth/agents/tools/addNewAiModel.js \
  "gpt-4" \
  1 \
  1 \
  "openai" \
  "large" \
  "openai" \
  3000 \
  6000 \
  1000 \
  "USD" \
  4096 \
  0.7 \
  "gpt-4" \
  true
```

This will:
- Deactivate any existing models named "gpt-4"
- Add a new "gpt-4" model with the specified configuration and mark it as active

## Notes

- The script validates that the `type` and `modelSize` arguments are valid values from the `PsAiModelType` and `PsAiModelSize` enums.
- If the argument count or values are invalid, the script will print usage instructions and exit.
- The script connects to the database, initializes models, and performs the necessary create/update operations.
- The model configuration is stored in the `configuration` field of the `ps_ai_models` table.

---

**Types Used:**

- `PsAiModelType`: Enum of supported AI model types.
- `PsAiModelSize`: Enum of supported model sizes.
- `PsAiModelConfiguration`: Configuration object for an AI model (see type definitions).
- `PsAiModel`: Sequelize model for the `ps_ai_models` table.

---

**File Path:**  
`@policysynth/agents/tools/addNewAiModel.js`