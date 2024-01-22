# PsServerApi

The `PsServerApi` class extends the `YpServerApi` class and provides methods to interact with a server API, specifically for fetching project data, middle solutions, and raw evidence.

## Properties

| Name         | Type   | Description                        |
|--------------|--------|------------------------------------|
| baseUrlPath  | string | The base URL path for the API.     |

## Methods

| Name                | Parameters                                             | Return Type                 | Description                                                                                   |
|---------------------|--------------------------------------------------------|-----------------------------|-----------------------------------------------------------------------------------------------|
| constructor         | urlPath: string = '/api'                               |                             | Initializes a new instance of `PsServerApi` with an optional `urlPath`.                      |
| getProject          | id: number, tempPassword?: string, forceGetBackupForProject?: string | Promise<CpsBootResponse>   | Fetches project data by ID, with optional temporary password and force backup retrieval flag. |
| getMiddleSolutions  | id: number, subProblemIndex: number                   | Promise<IEngineSolution[][]>| Fetches middle solutions for a given sub-problem index within a project.                      |
| getRawEvidence      | id: number, subProblemIndex: number, policyTitle: string | Promise<PSEvidenceRawWebPageData[]> | Fetches raw evidence data for a given policy within a sub-problem of a project.               |

## Examples

```typescript
// Example usage of PsServerApi to get a project
const psServerApi = new PsServerApi();
const projectData = await psServerApi.getProject(123);

// Example usage of PsServerApi to get middle solutions
const middleSolutions = await psServerApi.getMiddleSolutions(123, 1);

// Example usage of PsServerApi to get raw evidence
const rawEvidence = await psServerApi.getRawEvidence(123, 1, 'PolicyTitle');
```

Please note that the actual types `CpsBootResponse`, `IEngineSolution`, and `PSEvidenceRawWebPageData` are not defined in the provided code snippet. They should be defined elsewhere in your codebase.