# PsServerApi

`PsServerApi` extends `YpServerApi` to provide API methods for interacting with projects, solutions, and evidence data. It allows fetching project details, middle solutions, and raw evidence for a given policy title within a project. It also includes commented-out methods for interacting with surveys, voting, and idea submission.

## Properties

| Name        | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| baseUrlPath | string | The base URL path for the API endpoints.      |

## Methods

| Name                | Parameters                                                                 | Return Type                  | Description                                                                                   |
|---------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| constructor         | urlPath: string = '/api'                                                   | void                         | Initializes the API with an optional base URL path.                                          |
| getProject          | id: number, tempPassword?: string, forceGetBackupForProject?: string      | Promise<CpsBootResponse>    | Fetches project details. Optionally uses a temporary password and can force backup retrieval.|
| getMiddleSolutions  | id: number, subProblemIndex: number                                       | Promise<PsSolution[][]> | Fetches middle solutions for a given sub-problem within a project.                           |
| getRawEvidence      | id: number, subProblemIndex: number, policyTitle: string                  | Promise<PSEvidenceRawWebPageData[]> | Fetches raw evidence for a given policy title within a sub-problem of a project.             |

## Example

```typescript
import { PsServerApi } from '@policysynth/webapp/base/PsServerApi.js';

const api = new PsServerApi();

// Example usage of getProject
const projectDetails = await api.getProject(1);
console.log(projectDetails);

// Example usage of getMiddleSolutions
const middleSolutions = await api.getMiddleSolutions(1, 0);
console.log(middleSolutions);

// Example usage of getRawEvidence
const rawEvidence = await api.getRawEvidence(1, 0, 'PolicyTitle');
console.log(rawEvidence);
```