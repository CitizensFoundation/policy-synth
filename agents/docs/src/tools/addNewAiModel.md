# Add New AI Model Script

This script is used to add a new AI model to the database. It deactivates any existing models with the same name before adding the new model.

## Functions

### deactivateExistingModels

Deactivates existing AI models with the specified name.

#### Parameters

| Name | Type   | Description                        |
|------|--------|------------------------------------|
| name | string | The name of the AI model to deactivate. |

#### Example

```typescript
await deactivateExistingModels("exampleModelName");
```

### addAiModel

Adds a new AI model to the database. It first deactivates any existing models with the same name.

#### Parameters

| Name                    | Type              | Description                                                                 |
|-------------------------|-------------------|-----------------------------------------------------------------------------|
| name                    | string            | The name of the AI model.                                                   |
| organizationId          | number            | The ID of the organization.                                                 |
| userId                  | number            | The ID of the user.                                                         |
| type                    | PsAiModelType     | The type of the AI model.                                                   |
| modelSize               | PsAiModelSize     | The size of the AI model.                                                   |
| provider                | string            | The provider of the AI model.                                               |
| costInTokensPerMillion  | number            | The cost in tokens per million for input.                                   |
| costOutTokensPerMillion | number            | The cost in tokens per million for output.                                  |
| currency                | string            | The currency for the cost.                                                  |
| maxTokensOut            | number            | The maximum number of tokens out.                                           |
| defaultTemperature      | number            | The default temperature for the model.                                      |
| model                   | string            | The model identifier.                                                       |
| active                  | boolean           | Whether the model is active.                                                |

#### Example

```typescript
await addAiModel(
  "exampleModelName",
  1,
  1,
  PsAiModelType.GPT3,
  PsAiModelSize.Large,
  "OpenAI",
  1000,
  2000,
  "USD",
  2048,
  0.7,
  "gpt-3.5-turbo",
  true
);
```

## Usage

The script is intended to be run from the command line using `ts-node`. It requires 13 arguments:

```bash
ts-node addAiModelSeed.ts <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>
```

### Example Command

```bash
ts-node addAiModelSeed.ts "exampleModelName" 1 1 "GPT3" "Large" "OpenAI" 1000 2000 "USD" 2048 0.7 "gpt-3.5-turbo" true
```

### Argument Validation

- The `type` must be a valid `PsAiModelType`.
- The `modelSize` must be a valid `PsAiModelSize`.
- The `active` argument should be "true" or "false" to be converted to a boolean.

### Error Handling

If an error occurs during the addition of the AI model, it will be logged to the console.