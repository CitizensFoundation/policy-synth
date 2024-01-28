# ProjectsController

This class handles the routing for project-related API endpoints. It interacts with Redis for caching, manages WebSocket clients, and processes project data, including fetching and filtering evidence and solutions.

## Properties

| Name                         | Type                                      | Description                                      |
|------------------------------|-------------------------------------------|--------------------------------------------------|
| path                         | string                                    | Base path for project-related routes.            |
| router                       | express.Router                            | Express router for handling routes.              |
| evidenceWebPageVectorStore   | EvidenceWebPageVectorStore                | Instance for interacting with evidence data.     |
| wsClients                    | Map<string, WebSocket>                    | Map of WebSocket clients.                        |

## Methods

| Name                | Parameters                              | Return Type | Description                                                                 |
|---------------------|-----------------------------------------|-------------|-----------------------------------------------------------------------------|
| initializeRoutes    | None                                    | void        | Initializes the routes for the controller.                                  |
| getMiddleSolutions  | req: express.Request, res: express.Response | Promise<void> | Handles the request to get middle solutions for a sub-problem.              |
| getRawEvidence      | req: express.Request, res: express.Response | Promise<void> | Fetches raw evidence for a given policy within a sub-problem.               |
| getProject          | req: express.Request, res: express.Response | Promise<void> | Retrieves project data, handling caching, and filtering of sensitive data.  |

## Routes

- GET `/api/projects/:id/:forceBackupReloadId`
- GET `/api/projects/:id`
- GET `/api/projects/:id/:subProblemIndex/middle/solutions`
- GET `/api/projects/:id/:subProblemIndex/:policyTitle/rawEvidence`

## Example

```typescript
import express from "express";
import { ProjectsController } from '@policysynth/apicontrollers/projectsController.js';

const app = express();
const wsClients = new Map<string, WebSocket>();
const projectsController = new ProjectsController(wsClients);

app.use('/', projectsController.router);
```