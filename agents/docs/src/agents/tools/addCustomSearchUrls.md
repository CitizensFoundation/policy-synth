# IEngineInnovationMemoryData

Represents the memory data structure for an engine innovation project.

## Properties

| Name           | Type                      | Description                                   |
|----------------|---------------------------|-----------------------------------------------|
| subProblems    | ISubProblemData[]         | Array of sub-problem data objects.            |

## ISubProblemData

Represents the data structure for a sub-problem within an engine innovation project.

## Properties

| Name             | Type     | Description                                   |
|------------------|----------|-----------------------------------------------|
| customSearchUrls | string[] | Array of custom URLs related to the sub-problem. |

## Methods

| Name          | Parameters            | Return Type | Description                                 |
|---------------|-----------------------|-------------|---------------------------------------------|
| addCustomUrls | projectId: string     | void        | Adds custom URLs to the sub-problems memory |

## Examples

```typescript
// Example usage of adding custom URLs to a sub-problem
const projectId = 'example-project-id';
addCustomUrls(projectId).then(() => {
  console.log('Custom URLs added successfully.');
}).catch(console.error);
```

Please note that the provided TypeScript file does not include type definitions for `IEngineInnovationMemoryData` or `ISubProblemData`. These types should be defined elsewhere in the project for the above documentation to be accurate.