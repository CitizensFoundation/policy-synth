# PolicySynthApiApp

This class sets up and manages the PolicySynth API application, including initializing the express application, WebSocket server, Redis client, and handling controllers.

## Properties

| Name         | Type                          | Description                                                                 |
|--------------|-------------------------------|-----------------------------------------------------------------------------|
| app          | express.Application           | The express application instance.                                           |
| port         | number                        | The port number on which the application listens.                          |
| httpServer   | any                           | The HTTP server hosting the express application.                           |
| ws           | WebSocketServer               | The WebSocket server for real-time communication.                          |
| redisClient  | any                           | The Redis client for session storage and caching.                          |
| wsClients    | Map<string, WebSocket>        | A map to store WebSocket clients using a unique string identifier.         |

## Methods

| Name                   | Parameters                  | Return Type | Description                                                                 |
|------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| constructor            | controllers: Array<any>, port: number \| undefined = undefined | void        | Initializes the application, WebSocket server, Redis client, and controllers.|
| initializeMiddlewares  | N/A                         | void        | Sets up middlewares for the express application.                            |
| initializeControllers  | controllers: Array<any>     | void        | Initializes the controllers for handling routes.                            |
| listen                 | N/A                         | void        | Starts the HTTP server and listens for connections on the specified port.   |

## Examples

```
// Example usage of PolicySynthApiApp
import { PolicySynthApiApp } from '@policysynth/api/app.js';

const controllers = [YourController];
const port = 8000;
const app = new PolicySynthApiApp(controllers, port);

app.listen();
```