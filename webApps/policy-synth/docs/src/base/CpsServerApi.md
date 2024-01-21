# CpsServerApi

The `CpsServerApi` class extends the `YpServerApi` class to provide API methods specific to the CPS (Collaborative Problem Solving) server. It allows fetching project data, middle solutions, and raw evidence from the server.

## Properties

| Name         | Type   | Description                           |
|--------------|--------|---------------------------------------|
| baseUrlPath  | string | The base URL path for the API calls.  |

## Methods

| Name                | Parameters                                              | Return Type             | Description                                                                                   |
|---------------------|---------------------------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------|
| constructor         | urlPath: string = '/api'                                |                         | Initializes a new instance of the `CpsServerApi` class with an optional base URL path.        |
| getProject          | id: number, tempPassword?: string, forceGetBackupForProject?: string | Promise<CpsBootResponse> | Fetches project data including the boot response for a given project ID.                      |
| getMiddleSolutions  | id: number, subProblemIndex: number                    | Promise<IEngineSolution[][]> | Fetches middle solutions for a given project ID and sub-problem index.                        |
| getRawEvidence      | id: number, subProblemIndex: number, policyTitle: string | Promise<PSEvidenceRawWebPageData[]> | Fetches raw evidence data for a given project ID, sub-problem index, and policy title.        |

## Examples

```typescript
// Example usage of the CpsServerApi class to fetch project data
const cpsServerApi = new CpsServerApi();
const projectId = 123;
cpsServerApi.getProject(projectId).then((projectData) => {
  console.log(projectData);
});

// Example usage of the CpsServerApi class to fetch middle solutions
const subProblemIndex = 1;
cpsServerApi.getMiddleSolutions(projectId, subProblemIndex).then((solutions) => {
  console.log(solutions);
});

// Example usage of the CpsServerApi class to fetch raw evidence
const policyTitle = 'Sample Policy';
cpsServerApi.getRawEvidence(projectId, subProblemIndex, policyTitle).then((evidence) => {
  console.log(evidence);
});
```

Please note that the commented-out methods are not included in the documentation as they are not part of the active API. If you need documentation for those methods, please uncomment them and provide the necessary details.