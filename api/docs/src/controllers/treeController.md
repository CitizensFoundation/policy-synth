# TreeController

This class is responsible for managing the operations related to tree structures, including CRUD operations, validation, and configuration review. It extends the `BaseController` to utilize WebSocket communication and Redis for data persistence.

## Routes

- **GET** `/api/crt/:id` - Retrieves a tree by its ID.
- **POST** `/api/crt` - Creates a new tree with the provided context and undesirable effects.
- **POST** `/api/crt/:id/createDirectCauses` - Identifies and creates direct causes for a given node in the tree.
- **POST** `/api/crt/:id/addDirectCauses` - Adds direct causes to a specified node in the tree.
- **POST** `/api/crt/:id/getRefinedCauses` - Refines the causes for a given node by interacting with the user through WebSocket.
- **POST** `/api/crt/:id/runValidationChain` - Runs a validation chain for the specified node to validate the logic of the tree.
- **PUT** `/api/crt/reviewConfiguration` - Reviews the configuration of the tree to ensure it meets certain criteria.
- **PUT** `/api/crt/:id/updateChildren` - Updates the children of a specified node.
- **DELETE** `/api/crt/:id` - Deletes a node from the tree.
- **PUT** `/api/crt/:id` - Updates a specified node in the tree.

## Example

```typescript
import express from "express";
import WebSocket from "ws";
import { TreeController } from '@policysynth/apicontrollers/treeController.js';

const app = express();
const wsServer = new WebSocket.Server({ port: 8080 });
const wsClients = new Map<string, WebSocket>();

wsServer.on('connection', (ws: WebSocket) => {
  const id = generateUniqueID();
  wsClients.set(id, ws);

  ws.on('close', () => {
    wsClients.delete(id);
  });
});

const treeController = new TreeController(wsClients);
app.use('/api/crt', treeController.router);
```