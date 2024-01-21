# IEngineInnovationMemoryData

This interface represents the structure of the memory data for an engine innovation project.

## Properties

| Name          | Type                                  | Description               |
|---------------|---------------------------------------|---------------------------|
| subProblems   | ISubProblemData[]                     | Array of sub problem data.|

## ISubProblemData

This interface represents the structure of the sub problem data within an engine innovation project.

## Properties

| Name          | Type                                  | Description               |
|---------------|---------------------------------------|---------------------------|
| eloRating     | number \| undefined                   | The ELO rating of the sub problem.|

## Methods

No methods are defined for these interfaces.

## Examples

```typescript
// Example usage of the IEngineInnovationMemoryData interface
const memory: IEngineInnovationMemoryData = {
  subProblems: [
    {
      eloRating: 1080
    },
    {
      eloRating: 1070
    }
  ]
};

// Example of sorting subProblems by eloRating
memory.subProblems.sort((a, b) => {
  return (b.eloRating || 0) - (a.eloRating || 0);
});
```

# loadProject

This function loads a project's memory data from Redis, updates the ELO ratings for specific sub problems, sorts the sub problems by their ELO ratings, and then saves the updated memory data back to Redis.

## Methods

| Name          | Parameters        | Return Type | Description                 |
|---------------|-------------------|-------------|-----------------------------|
| loadProject   | -                 | Promise<void> | Loads and updates project memory data. |

## Examples

```typescript
// Example usage of the loadProject function
loadProject().catch(console.error);
```

Note: The actual TypeScript file provided does not include the explicit definitions for `IEngineInnovationMemoryData` or `ISubProblemData`. The properties and methods for these interfaces are assumed based on the usage within the provided code snippet. If these interfaces are defined elsewhere, the documentation should be updated accordingly to reflect their actual structure.