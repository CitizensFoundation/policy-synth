# PolicySynthApiApp

The `PolicySynthApiApp` class sets up an Express application with WebSocket support and Redis for session management. It is designed to initialize with a set of controllers and can serve static files as well as handle WebSocket connections.

## Properties

| Name        | Type                                      | Description                                      |
|-------------|-------------------------------------------|--------------------------------------------------|
| app         | express.Application                       | The Express application instance.                |
| port        | number                                    | The port number on which the server will listen. |
| httpServer  | any                                       | The HTTP server instance.                        |
| ws          | WebSocketServer                           | The WebSocket server instance.                   |
| redisClient | any                                       | The Redis client instance.                       |
| wsClients   | Map<string, WebSocket>                    | A map to store WebSocket clients.                |

## Methods

| Name                    | Parameters            | Return Type | Description                                      |
|-------------------------|-----------------------|-------------|--------------------------------------------------|
| constructor             | controllers: Array<any>, port: number \| undefined | void        | Initializes the app with controllers and optional port. |
| initializeMiddlewares   | -                     | void        | Sets up middlewares for the Express application. |
| initializeControllers   | controllers: Array<any> | void        | Initializes the controllers for the app.         |
| listen                  | -                     | void        | Starts the HTTP server and begins listening on the specified port. |

## Routes

The class itself does not define specific routes, but it initializes controllers that can define their own routes.

## Examples

```typescript
import { PolicySynthApiApp } from './PolicySynthApiApp';

const controllers = [/* array of controller instances */];
const port = 3000;
const app = new PolicySynthApiApp(controllers, port);

app.listen();
```

Note: The actual implementation of the controllers and their routes is not provided in the given code snippet.