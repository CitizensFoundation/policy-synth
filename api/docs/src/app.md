# PolicySynthApiApp

This class sets up and manages the PolicySynth API application, including initializing the express application, WebSocket server, Redis client, and handling controllers.

## Properties

| Name         | Type                        | Description                                                                 |
|--------------|-----------------------------|-----------------------------------------------------------------------------|
| app          | express.Application         | The express application instance.                                           |
| port         | number                      | The port number on which the application listens.                          |
| httpServer   | any                         | The HTTP server hosting the express application.                           |
| ws           | WebSocketServer             | The WebSocket server for real-time communication.                          |
| redisClient  | any                         | The Redis client for session storage and other caching needs.              |
| wsClients    | Map<string, WebSocket>      | A map to keep track of WebSocket clients using UUIDs as keys.              |

## Methods

| Name                   | Parameters                  | Return Type | Description                                                                 |
|------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| constructor            | controllers: Array<any>, port: number \| undefined = undefined | void        | Initializes the application, WebSocket server, Redis client, and controllers. |
| initializeMiddlewares  | -                           | void        | Sets up middlewares for the express application, including body parsing, static file serving, and session management. |
| initializeControllers  | controllers: Array<any>     | void        | Initializes the controllers for handling different routes.                  |
| listen                 | -                           | void        | Starts the HTTP server and begins listening on the specified port.          |

## Examples

```typescript
import { PolicySynthApiApp } from '@policysynth/apiapp.js';
import MyController from './controllers/MyController';

const controllers = [MyController];
const app = new PolicySynthApiApp(controllers);

app.listen();
```

This example demonstrates how to import and use the `PolicySynthApiApp` class to create an instance of the application with a specified controller and start listening on the default or specified port.