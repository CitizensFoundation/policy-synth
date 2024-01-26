# BaseController

This class serves as an abstract base for controllers within the application. It initializes with WebSocket clients and provides a router for express applications.

## Properties

| Name                | Type                                      | Description                                      |
|---------------------|-------------------------------------------|--------------------------------------------------|
| router              | express.Router                            | Express router for handling HTTP routes.         |
| wsClients           | Map<string, WebSocket>                    | A map of WebSocket clients identified by string. |
| basePromptOverrides | Map<number, string> \| undefined          | Optional map for base prompt overrides.          |

## Methods

This class does not explicitly define any methods, as it is an abstract class meant to be extended by other controllers.

## Examples

```
// Example usage within an express application
import { BaseController } from '@policysynth/api/controllers/baseController.js';

class ChatController extends BaseController {
  constructor(wsClients) {
    super(wsClients);
    this.router.get('/', this.handleChat.bind(this));
  }

  handleChat(req, res) {
    // Implementation for handling chat
  }
}
```