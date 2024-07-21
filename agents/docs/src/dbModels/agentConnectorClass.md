# PsAgentConnectorClass

The `PsAgentConnectorClass` class represents the schema for agent connector classes in the database. It extends the Sequelize `Model` class and implements the `PsAgentConnectorClassAttributes` interface.

## Properties

| Name            | Type                              | Description                                      |
|-----------------|-----------------------------------|--------------------------------------------------|
| id              | number                            | Primary key, auto-incremented integer.           |
| uuid            | string                            | Unique identifier for the connector class.       |
| user_id         | number                            | ID of the user who created the connector class.  |
| class_base_id   | string                            | Base ID for the class, used for versioning.      |
| created_at      | Date                              | Timestamp when the record was created.           |
| updated_at      | Date                              | Timestamp when the record was last updated.      |
| name            | string                            | Name of the connector class.                     |
| version         | number                            | Version number of the connector class.           |
| available       | boolean                           | Availability status of the connector class.      |
| configuration   | PsAgentConnectorConfiguration     | Configuration details for the connector class.   |

## Example

```typescript
import { PsAgentConnectorClass } from '@policysynth/agents/dbModels/agentConnectorClass.js';

// Example usage of PsAgentConnectorClass
const newConnectorClass = await PsAgentConnectorClass.create({
  user_id: 1,
  class_base_id: 'some-unique-id',
  name: 'Google Docs Connector',
  version: 1,
  available: true,
  configuration: {
    name: 'Google Docs',
    classType: 'googleDocs',
    description: 'Connector for Google Docs',
    imageUrl: 'https://example.com/image.png',
    iconName: 'docs',
    questions: [
      {
        uniqueId: 'name',
        text: 'Name',
        type: 'textField',
        maxLength: 200,
        required: false
      },
      {
        uniqueId: 'googleDocsId',
        text: 'Document ID',
        type: 'textField',
        maxLength: 200,
        required: false
      },
      {
        uniqueId: 'googleServiceAccount',
        text: 'ServiceAccount JSON',
        type: 'textArea',
        rows: 10,
        required: false
      }
    ]
  }
});
```

## Sequelize Initialization

The `PsAgentConnectorClass` model is initialized with the following schema:

```typescript
PsAgentConnectorClass.init(
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
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_connector_classes",
    indexes: [
      {
        fields: ["uuid"],
        unique: true
      },
      {
        fields: ["class_base_id"],
      },
      {
        fields: ["class_base_id","version"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["name"],
      },
      {
        fields: ["version"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```