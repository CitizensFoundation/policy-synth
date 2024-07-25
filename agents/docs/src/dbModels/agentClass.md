# PsAgentClass

The `PsAgentClass` class represents an agent class in the system. It extends the Sequelize `Model` and implements the `PsAgentClassAttributes` interface.

## Properties

| Name            | Type                                      | Description                                                                 |
|-----------------|-------------------------------------------|-----------------------------------------------------------------------------|
| id              | number                                    | The unique identifier for the agent class.                                  |
| uuid            | string                                    | The universally unique identifier for the agent class.                      |
| class_base_id   | string                                    | The base identifier for the agent class.                                    |
| user_id         | number                                    | The identifier of the user who created the agent class.                     |
| created_at      | Date                                      | The date and time when the agent class was created.                         |
| updated_at      | Date                                      | The date and time when the agent class was last updated.                    |
| name            | string                                    | The name of the agent class.                                                |
| version         | number                                    | The version of the agent class.                                             |
| configuration   | PsAgentClassAttributesConfiguration       | The configuration details of the agent class.                               |
| available       | boolean                                   | Indicates whether the agent class is available.                             |

## Example

```typescript
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';

// Example usage of PsAgentClass
const newAgentClass = await PsAgentClass.create({
  name: "Example Agent Class",
  user_id: 1,
  version: 1,
  configuration: {
    description: "An example agent class",
    queueName: "example_queue",
    imageUrl: "https://example.com/image.png",
    iconName: "example_icon",
    capabilities: ["example_capability"],
    requestedAiModelSizes: ["small", "medium"],
    questions: [
      {
        uniqueId: "example_question",
        text: "Example Question",
        type: "textField",
        maxLength: 200,
        required: true,
      },
    ],
    supportedConnectors: ["example_connector"],
  },
  available: true,
});
```

## Sequelize Initialization

The `PsAgentClass` model is initialized with the following schema:

```typescript
PsAgentClass.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    class_base_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_classes",
    indexes: [
      {
        fields: ["uuid"],
        unique: true,
      },
      {
        fields: ["class_base_id"],
      },
      {
        fields: ["class_base_id", "version"],
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

This schema defines the structure of the `ps_agent_classes` table in the database, including the data types and constraints for each column.