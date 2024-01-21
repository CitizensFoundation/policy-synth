# BaseController

Brief description of the class.

## Properties

| Name                 | Type                                         | Description               |
|----------------------|----------------------------------------------|---------------------------|
| router               | express.Router                               | Express router for the controller. |
| wsClients            | Map<string, WebSocket>                       | A map of WebSocket clients keyed by a string identifier. |
| basePromptOverrides  | Map<number, string> \| undefined             | Optional map for prompt overrides, keyed by a numeric identifier. |

## Methods

No public methods documented.

## Routes

Since `BaseController` is an abstract class, specific routes are to be implemented in derived classes.

## Examples

```typescript
// Example usage of BaseController is not provided as it is an abstract class and should be extended by other classes.
```