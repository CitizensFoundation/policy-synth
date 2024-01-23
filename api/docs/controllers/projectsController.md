# ProjectsController

The `ProjectsController` class is responsible for handling HTTP requests related to project data. It provides endpoints for retrieving project details, middle solutions of sub-problems, and raw evidence for policies. It also manages WebSocket clients for real-time communication and interacts with a Redis client for caching.

## Properties

| Name                         | Type                                      | Description                                                                 |
|------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| path                         | string                                    | The base path for the controller's routes.                                  |
| router                       | express.Router                            | The router object from Express used to define routes.                       |
| evidenceWebPageVectorStore   | EvidenceWebPageVectorStore                | An instance of EvidenceWebPageVectorStore for managing evidence data.       |
| wsClients                    | Map<string, WebSocket>                    | A map to store WebSocket clients, indexed by a string identifier.           |

## Methods

| Name                 | Parameters                  | Return Type       | Description                                                                                   |
|----------------------|-----------------------------|-------------------|-----------------------------------------------------------------------------------------------|
| initializeRoutes     | -                           | Promise<void>     | Initializes the routes for the controller and connects to the Redis client.                   |
| getMiddleSolutions   | req: express.Request, res: express.Response | Promise<void>     | Retrieves and sends the middle solutions for a given sub-problem of a project.                |
| getRawEvidence       | req: express.Request, res: express.Response | Promise<void>     | Retrieves and sends the raw evidence for a given policy within a sub-problem of a project.    |
| getProject           | req: express.Request, res: express.Response | Promise<void>     | Retrieves and sends the project data, including handling of memory cache and backup retrieval.|

## Routes

### GET /api/projects/:id/:forceBackupReloadId
Retrieves the project data for a given project ID, with an option to force reload from a backup.

### GET /api/projects/:id
Retrieves the project data for a given project ID.

### GET /api/projects/:id/:subProblemIndex/middle/solutions
Retrieves the middle solutions for a given sub-problem index within a project.

### GET /api/projects/:id/:subProblemIndex/:policyTitle/rawEvidence
Retrieves the raw evidence for a given policy title within a sub-problem of a project.

## Examples

```typescript
// Example usage of ProjectsController
const expressApp = express();
const wsClients = new Map<string, WebSocket>();
const projectsController = new ProjectsController(wsClients);

expressApp.use('/', projectsController.router);
```