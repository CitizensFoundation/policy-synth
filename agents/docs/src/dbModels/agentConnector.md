# PsAgentConnector

The `PsAgentConnector` class represents a connector for agents in the system. It extends the Sequelize `Model` class and implements the `PsAgentConnectorAttributes` interface.

## Properties

| Name          | Type                                | Description                                      |
|---------------|-------------------------------------|--------------------------------------------------|
| id            | number                              | Primary key, auto-incremented.                   |
| uuid          | string                              | Universally unique identifier (UUID).            |
| user_id       | number                              | Foreign key referencing the user.                |
| created_at    | Date                                | Timestamp of when the record was created.        |
| updated_at    | Date                                | Timestamp of when the record was last updated.   |
| class_id      | number                              | Foreign key referencing the connector class.     |
| group_id      | number                              | Foreign key referencing the group.               |
| configuration | PsAgentConnectorsBaseConfiguration  | JSONB configuration for the connector.           |
| User          | YpUserData                          | Associated user data.                            |
| Group         | YpGroupData                         | Associated group data.                           |
| Class         | PsAgentConnectorClassAttributes     | Associated connector class data.                 |
| InputAgents   | PsAgentAttributes[]                 | Associated input agents.                         |
| OutputAgents  | PsAgentAttributes[]                 | Associated output agents.                        |

## Methods

### init

Initializes the `PsAgentConnector` model with its attributes and options.

```typescript
PsAgentConnector.init(
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
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_connectors",
    indexes: [
      {
        fields: ["uuid"],
        unique: true
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["class_id"],
      },
      {
        fields: ["group_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

### associate

Defines the associations for the `PsAgentConnector` model.

```typescript
(PsAgentConnector as any).associate = (models: any) => {
  console.log(`PsAgentConnector.associate ${JSON.stringify(models.PsAgentConnectorClass)}`)
  // Define associations
  PsAgentConnector.belongsTo(models.PsAgentConnectorClass, {
    foreignKey: "class_id",
    as: "Class",
  });
  PsAgentConnector.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
  });
  PsAgentConnector.belongsTo(models.Group, {
    foreignKey: "group_id",
    as: "Group",
  });

  PsAgentConnector.hasMany(models.PsExternalApiUsage, {
    foreignKey: "connector_id",
    as: "ExternalApiUsage",
  });

  PsAgentConnector.hasMany(models.PsModelUsage, {
    foreignKey: "connector_id",
    as: "ModelUsage",
  });

  // Through a join table
  PsAgentConnector.belongsToMany(models.PsAgent, {
    through: "AgentInputConnectors",
    foreignKey: "connector_id",
    otherKey: "agent_id",
    as: "InputAgents",
    timestamps: false,
  });

  PsAgentConnector.belongsToMany(models.PsAgent, {
    through: "AgentOutputConnectors",
    foreignKey: "connector_id",
    otherKey: "agent_id",
    as: "OutputAgents",
    timestamps: false,
  });
};
```

## Example

```typescript
import { PsAgentConnector } from '@policysynth/agents/dbModels/agentConnector.js';

// Example usage of PsAgentConnector
const connector = await PsAgentConnector.create({
  user_id: 1,
  class_id: 1,
  group_id: 1,
  configuration: {
    name: "Example Connector",
    classType: "exampleType",
    description: "This is an example connector",
    imageUrl: "https://example.com/image.png",
    iconName: "exampleIcon",
    questions: [],
  },
});
```