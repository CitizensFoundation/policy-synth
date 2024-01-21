# ProjectsController

The `ProjectsController` class is responsible for handling HTTP requests related to project data. It interacts with a Redis client for caching and serves project data, middle solutions, and raw evidence for policies.

## Properties

| Name                          | Type                                      | Description                                       |
|-------------------------------|-------------------------------------------|---------------------------------------------------|
| path                          | string                                    | The base path for the controller's routes.        |
| router                        | express.Router                            | The router object for handling routes.            |
| evidenceWebPageVectorStore    | EvidenceWebPageVectorStore                | An instance to handle vector store operations.    |
| wsClients                     | Map<string, WebSocket>                    | A map to keep track of WebSocket clients.         |

## Methods

| Name                | Parameters                     | Return Type | Description                                                                 |
|---------------------|--------------------------------|-------------|-----------------------------------------------------------------------------|
| initializeRoutes    | -                              | void        | Initializes the routes for the controller and connects to the Redis client. |
| getMiddleSolutions  | req: express.Request, res: express.Response | Promise<void> | Handles the request to get middle solutions for a sub-problem.              |
| getRawEvidence      | req: express.Request, res: express.Response | Promise<void> | Handles the request to get raw evidence for a policy.                       |
| getProject          | req: express.Request, res: express.Response | Promise<void> | Handles the request to get project data.                                    |

## Routes

### GET /api/projects/:id/:forceBackupReloadId

Retrieves the project data for a given project ID and force backup reload ID.

### GET /api/projects/:id

Retrieves the project data for a given project ID.

### GET /api/projects/:id/:subProblemIndex/middle/solutions

Retrieves the middle solutions for a given project ID and sub-problem index.

### GET /api/projects/:id/:subProblemIndex/:policyTitle/rawEvidence

Retrieves the raw evidence for a given project ID, sub-problem index, and policy title.

## Examples

```typescript
// Example usage of ProjectsController
const expressApp = express();
const wsClients = new Map<string, WebSocket>();
const projectsController = new ProjectsController(wsClients);

expressApp.use('/api/projects', projectsController.router);
```

Note: The actual implementation of the `ProjectsController` class includes additional logic and interactions with Redis and other services that are not fully detailed in this documentation.