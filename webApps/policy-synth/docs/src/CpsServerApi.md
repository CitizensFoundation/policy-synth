# CpsServerApi

The `CpsServerApi` class extends the `YpServerApi` class and provides methods to interact with a server API for various operations related to projects, solutions, and evidence data.

## Properties

| Name         | Type   | Description                           |
|--------------|--------|---------------------------------------|
| baseUrlPath  | string | The base URL path for the API calls.  |

## Methods

| Name                | Parameters                                                                 | Return Type                | Description                                                                                   |
|---------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------------------------|
| constructor         | urlPath: string = '/api'                                                   |                            | Initializes a new instance of the `CpsServerApi` class with an optional base URL path.        |
| getProject          | id: number, tempPassword?: string, forceGetBackupForProject?: string       | Promise<CpsBootResponse>   | Retrieves a project by its ID, with optional parameters for temporary password and backup.   |
| getMiddleSolutions  | id: number, subProblemIndex: number                                        | Promise<IEngineSolution[][]> | Fetches middle solutions for a given sub-problem index within a project.                      |
| getRawEvidence      | id: number, subProblemIndex: number, policyTitle: string                   | Promise<PSEvidenceRawWebPageData[]> | Retrieves raw evidence data for a specific policy within a sub-problem of a project.         |

## Examples

```typescript
// Example usage of the CpsServerApi class to get a project
const cpsServerApi = new CpsServerApi();
const projectId = 123;
cpsServerApi.getProject(projectId)
  .then(projectData => {
    console.log(projectData);
  })
  .catch(error => {
    console.error('Error fetching project:', error);
  });

// Example usage of the CpsServerApi class to get middle solutions
const subProblemIndex = 1;
cpsServerApi.getMiddleSolutions(projectId, subProblemIndex)
  .then(solutions => {
    console.log(solutions);
  })
  .catch(error => {
    console.error('Error fetching middle solutions:', error);
  });

// Example usage of the CpsServerApi class to get raw evidence
const policyTitle = 'Sample Policy';
cpsServerApi.getRawEvidence(projectId, subProblemIndex, policyTitle)
  .then(evidenceData => {
    console.log(evidenceData);
  })
  .catch(error => {
    console.error('Error fetching raw evidence:', error);
  });
```