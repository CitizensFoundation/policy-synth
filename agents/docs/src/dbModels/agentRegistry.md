# PsAgentRegistry

The `PsAgentRegistry` class represents a registry for agents and connectors in the system. It extends the Sequelize `Model` class and implements the `PsAgentRegistryAttributes` interface.

## Properties

| Name          | Type                          | Description                                      |
|---------------|-------------------------------|--------------------------------------------------|
| id            | number                        | Primary key, auto-incremented.                   |
| uuid          | string                        | Unique identifier for the registry.              |
| user_id       | number                        | ID of the user who owns the registry.            |
| created_at    | Date                          | Timestamp when the registry was created.         |
| updated_at    | Date                          | Timestamp when the registry was last updated.    |
| configuration | PsAgentRegistryConfiguration  | Configuration details for the registry.          |
| Agents        | PsAgentClassAttributes[]      | List of associated agent classes.                |
| Connectors    | PsAgentConnectorClassAttributes[] | List of associated connector classes.        |

## Methods

| Name           | Parameters                | Return Type | Description                                      |
|----------------|---------------------------|-------------|--------------------------------------------------|
| addAgent       | agent: PsAgentClass       | Promise<void> | Adds an agent to the registry.                   |
| addConnector   | connector: PsAgentConnectorClass | Promise<void> | Adds a connector to the registry.               |
| removeAgent    | agent: PsAgentClass       | Promise<void> | Removes an agent from the registry.              |
| removeConnector| connector: PsAgentConnectorClass | Promise<void> | Removes a connector from the registry.          |

## Example

```typescript
import { PsAgentRegistry } from '@policysynth/agents/dbModels/agentRegistry.js';
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { PsAgentConnectorClass } from '@policysynth/agents/dbModels/agentConnectorClass.js';

// Example usage of PsAgentRegistry
const registry = await PsAgentRegistry.create({
  user_id: 1,
  configuration: {
    supportedAgents: []
  }
});

const agent = await PsAgentClass.findByPk(1);
const connector = await PsAgentConnectorClass.findByPk(1);

await registry.addAgent(agent);
await registry.addConnector(connector);
```

## Sequelize Initialization

The `PsAgentRegistry` model is initialized with the following schema:

```typescript
PsAgentRegistry.init(
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
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_registries",
    indexes: [
      {
        fields: ["uuid"],
        unique: true,
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

## Associations

The `PsAgentRegistry` model has the following associations:

```typescript
(PsAgentRegistry as any).associate = (models: any) => {
  PsAgentRegistry.belongsToMany(models.PsAgentClass, {
    through: "AgentRegistryAgents",
    as: "Agents",
    foreignKey: "ps_agent_registry_id",
    otherKey: "ps_agent_class_id",
    timestamps: true,
  });

  PsAgentRegistry.belongsToMany(models.PsAgentConnectorClass, {
    through: "AgentRegistryConnectors",
    as: "Connectors",
    foreignKey: "ps_agent_registry_id",
    otherKey: "ps_agent_connector_class_id",
    timestamps: true,
  });
};
```