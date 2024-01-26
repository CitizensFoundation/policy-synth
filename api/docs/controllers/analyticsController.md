# AnalyticsController

This class is responsible for handling analytics-related routes and actions within the application.

## Properties

| Name      | Type                          | Description                                      |
|-----------|-------------------------------|--------------------------------------------------|
| path      | string                        | The base path for analytics routes.              |
| router    | express.Router                | The router object for managing routes.           |
| wsClients | Map<string, WebSocket>        | A map to store WebSocket clients by some key.    |

## Methods

| Name                | Parameters                          | Return Type | Description                                      |
|---------------------|-------------------------------------|-------------|--------------------------------------------------|
| initializeRoutes    |                                     | void        | Initializes the routes for analytics actions.    |
| createActivityFromApp | req: express.Request, res: express.Response | Promise<void> | Handles the creation of an activity from an app. |

## Examples

```
import express from "express";
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import WebSocket from "ws";

const app = express();
const wsClients = new Map<string, WebSocket>();

const analyticsController = new AnalyticsController(wsClients);
app.use('/', analyticsController.router);
```