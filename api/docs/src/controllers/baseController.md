# BaseController

This class serves as an abstract base for controllers, providing common properties and a constructor for initializing WebSocket clients.

## Properties

| Name                | Type                                      | Description                                      |
|---------------------|-------------------------------------------|--------------------------------------------------|
| router              | express.Router                            | Express router for handling HTTP routes.         |
| wsClients           | Map<string, WebSocket>                    | A map of WebSocket clients identified by a string. |
| basePromptOverrides | Map<number, string> \| undefined          | Optional map for overriding base prompts.        |

## Methods

This class does not explicitly define any methods, as it is abstract and meant to be extended by other classes.

## Routes

This documentation does not include specific routes as they are to be defined in subclasses that extend `BaseController`.

## Examples

```typescript
import { BaseController } from '@policysynth/apicontrollers/baseController.js';
import express from "express";
import WebSocket from "ws";

class CustomController extends BaseController {
  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.router.get('/', (req, res) => {
      res.send('Hello from CustomController');
    });
  }
}

const wsClients = new Map<string, WebSocket>();
const customController = new CustomController(wsClients);

const app = express();
app.use('/custom', customController.router);
app.listen(3000, () => console.log('Server running on port 3000'));
```