# PsAgentAuditLog

The `PsAgentAuditLog` class represents the audit logs for agent actions within the system. It extends the Sequelize `Model` class and implements the `PsAgentAuditLogAttributes` interface.

## Properties

| Name         | Type                     | Description                                      |
|--------------|--------------------------|--------------------------------------------------|
| id           | number                   | The unique identifier for the audit log.         |
| user_id      | number                   | The ID of the user who performed the action.     |
| created_at   | Date                     | The timestamp when the audit log was created.    |
| updated_at   | Date                     | The timestamp when the audit log was last updated.|
| agent_id     | number                   | The ID of the agent associated with the action.  |
| connector_id | number                   | The ID of the connector associated with the action.|
| action       | string                   | The action performed by the user.                |
| details      | PsAgentAuditLogDetails   | Additional details about the action.             |

## Initialization

The `PsAgentAuditLog` model is initialized with the following schema:

```typescript
PsAgentAuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "ps_agent_audit_logs",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["agent_id"],
      },
      {
        fields: ["connector_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

## Example

```typescript
import { PsAgentAuditLog } from '@policysynth/agents/dbModels/agentAuditLog.js';

// Creating a new audit log entry
const newAuditLog = await PsAgentAuditLog.create({
  user_id: 1,
  agent_id: 123,
  action: 'Agent started',
  details: {
    description: 'The agent was started successfully.'
  }
});

// Fetching audit logs for a specific user
const userAuditLogs = await PsAgentAuditLog.findAll({
  where: {
    user_id: 1
  }
});
```

This example demonstrates how to create a new audit log entry and fetch audit logs for a specific user using the `PsAgentAuditLog` model.