# PsEval

The `PsEval` class represents the evaluation of an agent in the system. It extends the Sequelize `Model` class and implements the `PsAgentEvalAttributes` interface.

## Properties

| Name          | Type                        | Description                                      |
|---------------|-----------------------------|--------------------------------------------------|
| id            | number                      | Primary key, auto-incremented.                   |
| user_id       | number                      | ID of the user who created the evaluation.       |
| created_at    | Date                        | Timestamp when the evaluation was created.       |
| updated_at    | Date                        | Timestamp when the evaluation was last updated.  |
| overall_score | number                      | Overall score of the evaluation.                 |
| agent_id      | number                      | ID of the agent being evaluated.                 |
| notes         | string                      | Additional notes for the evaluation.             |
| results       | PsAgentEvalCriterionResult[]| Array of criterion results for the evaluation.   |

## Initialization

The `PsEval` model is initialized with the following schema:

```typescript
PsEval.init(
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
      allowNull: false,
    },
    overall_score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_evals",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["agent_id"],
      }
    ],
    timestamps: true,
    underscored: true,
  }
);
```

## Example

```typescript
import { PsEval } from '@policysynth/agents/dbModels/agentEval.js';

// Example usage of PsEval
async function createEvaluation() {
  const evaluation = await PsEval.create({
    user_id: 1,
    agent_id: 1,
    overall_score: 85,
    results: [
      {
        criterionUuid: "uuid-1",
        score: 90,
        feedback: "Excellent performance."
      },
      {
        criterionUuid: "uuid-2",
        score: 80,
        feedback: "Good, but can improve."
      }
    ],
    notes: "Overall good performance with room for improvement."
  });

  console.log(evaluation);
}

createEvaluation();
```