# ProjectsController

This class is responsible for handling project-related routes in the application. It interacts with Redis for caching, manages WebSocket clients, and processes project data, including fetching and filtering project information and evidence.

## Properties

| Name                         | Type                                             | Description                                      |
|------------------------------|--------------------------------------------------|--------------------------------------------------|
| path                         | string                                           | Base path for project-related routes.            |
| router                       | express.Router                                   | Express router for handling HTTP requests.       |
| evidenceWebPageVectorStore   | EvidenceWebPageVectorStore                       | Store for managing evidence web page vectors.    |
| wsClients                    | Map<string, WebSocket>                           | Map of WebSocket clients by some identifier.     |

## Methods

| Name                | Parameters                                  | Return Type            | Description                                                                 |
|---------------------|---------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| initializeRoutes    | -                                           | Promise<void>          | Initializes the routes for project-related endpoints.                       |
| getMiddleSolutions  | req: express.Request, res: express.Response | Promise<void>          | Fetches and returns the middle solutions for a given project and subproblem.|
| getRawEvidence      | req: express.Request, res: express.Response | Promise<void>          | Fetches and returns raw evidence for a given project, subproblem, and policy.|
| getProject          | req: express.Request, res: express.Response | Promise<void>          | Fetches and returns project data, handling caching and data filtering.      |

## Examples

```
import express from "express";
import { ProjectsController } from '@policysynth/api/controllers/projectsController.js';

const app = express();
const wsClients = new Map<string, WebSocket>();
const projectsController = new ProjectsController(wsClients);

app.use('/api', projectsController.router);
```