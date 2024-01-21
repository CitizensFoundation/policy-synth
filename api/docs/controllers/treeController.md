# TreeController

TreeController is a controller class that manages operations related to the manipulation of tree data structures within an application. It provides endpoints for creating, updating, retrieving, and deleting nodes in a tree, as well as running validation chains and refining causes.

## Properties

| Name   | Type                      | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| path   | string                    | The base path for the controller's endpoints. |

## Methods

| Name                   | Parameters                                  | Return Type | Description                                                                 |
|------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| initializeRoutes       | -                                           | void        | Initializes the routes for the controller.                                  |
| updateNode             | req: express.Request, res: express.Response | Promise     | Updates a node in the tree.                                                 |
| updateNodeChildren     | req: express.Request, res: express.Response | Promise     | Updates the children of a node in the tree.                                 |
| deleteNode             | req: express.Request, res: express.Response | Promise     | Deletes a node from the tree.                                               |
| runValidationChain     | req: express.Request, res: express.Response | Promise     | Runs a validation chain for a node in the tree.                             |
| getRefinedCauses       | req: express.Request, res: express.Response | Promise     | Retrieves refined causes for a node in the tree.                            |
| addDirectCauses        | req: express.Request, res: express.Response | Promise     | Adds direct causes to a node in the tree.                                   |
| getTree                | req: express.Request, res: express.Response | Promise     | Retrieves the tree data for a given ID.                                     |
| addNode                | req: express.Request, res: express.Response | Promise     | Adds a new node to the tree.                                                |
| reviewTreeConfiguration | req: express.Request, res: express.Response | Promise     | Reviews the configuration of a tree.                                        |
| createTree             | req: express.Request, res: express.Response | Promise     | Creates a new tree with the given context and undesirable effects.          |
| createDirectCauses     | req: express.Request, res: express.Response | Promise     | Creates direct causes for a node in the tree.                               |
| getData                | key: string \| number                       | Promise     | Retrieves data from the storage by key.                                     |
| setData                | key: string \| number, value: string        | Promise     | Sets data in the storage by key.                                            |
| createData             | value: string \| any                        | Promise     | Creates a new data entry in the storage and returns the generated key.      |
| deleteData             | key: string \| number                       | Promise     | Deletes data from the storage by key.                                       |
| getParentNodes         | nodes: LtpCurrentRealityTreeDataNode[], childId: string | LtpCurrentRealityTreeDataNode[] | Retrieves the parent nodes of a given child node. |
| findNearestUde         | nodes: LtpCurrentRealityTreeDataNode[], nodeId: string | LtpCurrentRealityTreeDataNode \| null | Finds the nearest UDE node to the given node ID. |
| findParentNode         | nodes: LtpCurrentRealityTreeDataNode[], childId: string | LtpCurrentRealityTreeDataNode \| null | Finds the parent node of the given child node ID. |
| isParentNode           | node: LtpCurrentRealityTreeDataNode, childId: string | boolean | Checks if the given node is a parent of the child node with the specified ID. |
| findNode               | nodes: LtpCurrentRealityTreeDataNode[], id: string | LtpCurrentRealityTreeDataNode \| null | Finds a node in the tree by its ID. |

## Routes

| Method | Route                                    | Action                     |
|--------|------------------------------------------|----------------------------|
| GET    | /api/crt/:id                            | Retrieves a tree by ID.    |
| POST   | /api/crt                                | Creates a new tree.        |
| POST   | /api/crt/:id/createDirectCauses         | Creates direct causes.     |
| POST   | /api/crt/:id/addDirectCauses            | Adds direct causes.        |
| POST   | /api/crt/:id/getRefinedCauses           | Retrieves refined causes.  |
| POST   | /api/crt/:id/runValidationChain         | Runs a validation chain.   |
| PUT    | /api/crt/reviewConfiguration            | Reviews tree configuration.|
| PUT    | /api/crt/:id/updateChildren             | Updates node children.     |
| DELETE | /api/crt/:id                            | Deletes a node.            |
| PUT    | /api/crt/:id                            | Updates a node.            |

## Examples

```typescript
// Example usage of the TreeController
const wsClients = new Map<string, WebSocket>();
const treeController = new TreeController(wsClients);

// Example of updating a node
const expressRequest = {
  params: { id: 'nodeId' },
  body: { description: 'Updated node description' }
} as express.Request;

const expressResponse = {
  sendStatus: (code: number) => console.log(`Status: ${code}`),
  send: (data: any) => console.log(data)
} as express.Response;

treeController.updateNode(expressRequest, expressResponse);
```
