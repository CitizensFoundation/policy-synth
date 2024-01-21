# App

The `App` class is responsible for setting up an Express application, initializing middleware, handling WebSocket connections, and setting up controllers.

## Properties

| Name        | Type                                  | Description                                      |
|-------------|---------------------------------------|--------------------------------------------------|
| app         | express.Application                   | The Express application instance.                |
| port        | number                                | The port number on which the server will listen. |
| ws          | WebSocketServer                       | The WebSocket server instance.                   |
| wsClients   | Map<string, WebSocket>                | A map to store WebSocket clients by their ID.    |

## Methods

| Name                    | Parameters            | Return Type | Description                                      |
|-------------------------|-----------------------|-------------|--------------------------------------------------|
| constructor             | controllers: Array<any>, port: number | void        | Initializes the app with given controllers and port. |
| initializeMiddlewares   | -                     | void        | Sets up the middleware for the Express application. |
| initializeControllers   | controllers: Array<any> | void        | Initializes the controllers and their routes.    |
| listen                  | -                     | void        | Starts the HTTP server and begins listening on the specified port. |

## Routes

The `App` class does not define routes directly; it initializes controllers that define their own routes.

## Examples

```typescript
import { App } from './path-to-app-class';

const controllers = [/* array of controller instances */];
const port = 8000;
const myApp = new App(controllers, port);

myApp.listen();
```

Note: The actual implementation of the `App` class includes additional private methods and logic for setting up WebSocket connections and handling static file serving, which are not detailed in this documentation.