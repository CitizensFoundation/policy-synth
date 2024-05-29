# PolicySynthApiApp

This class encapsulates the setup and management of an Express application, including WebSocket and Redis client integration for real-time communication and session management.

## Properties

| Name         | Type                        | Description                                                                 |
|--------------|-----------------------------|-----------------------------------------------------------------------------|
| app          | express.Application         | The Express application instance.                                           |
| port         | number                      | The port number on which the server listens.                               |
| httpServer   | any                         | The HTTP server hosting the Express application.                           |
| ws           | WebSocketServer             | The WebSocket server for handling real-time connections.                   |
| redisClient  | any                         | The Redis client for session storage and other caching needs.              |
| wsClients    | Map<string, WebSocket>      | A map to keep track of WebSocket clients using UUIDs as keys.              |

## Methods

| Name                  | Parameters             | Return Type | Description                                                                 |
|-----------------------|------------------------|-------------|-----------------------------------------------------------------------------|
| constructor           | controllers: Array<any>, port: number \| undefined = undefined | None        | Initializes the application with middleware, static paths, and controllers. |
| setupStaticPaths      | None                   | void        | Sets up static file serving for the application.                            |
| initializeMiddlewares | None                   | void        | Initializes necessary middleware for the application.                       |
| initializeControllers | controllers: Array<any>| void        | Initializes the controllers passed to the application.                      |
| listen                | None                   | void        | Starts the HTTP server and listens on the specified port.                   |

## Examples

```typescript
import { PolicySynthApiApp } from '@policysynth/apiapp';

const controllers = [/* Array of controller classes to initialize with the app */];
const port = 8000;

const app = new PolicySynthApiApp(controllers, port);
app.listen();
```