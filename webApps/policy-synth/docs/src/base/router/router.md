# PsRouter

A root-level router that installs global event listeners to intercept navigation. This class extends Routes so that it can also have a route configuration. There should only be one Router instance on a page, since the Router installs global event listeners on `window` and `document`. Nested routes should be configured with the `Routes` class.

## Properties

No public properties.

## Methods

| Name              | Parameters        | Return Type | Description                                                                 |
|-------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| hostConnected     |                   | void        | Sets up global event listeners for click and popstate events and navigates to the current URL. |
| hostDisconnected  |                   | void        | Removes global event listeners for click and popstate events.               |
| _onClick          | e: MouseEvent     | void        | Handles click events on anchor elements to navigate without a page reload.  |
| _onPopState       | _e: PopStateEvent | void        | Handles popstate events to navigate to the current URL without a page reload. |

## Events

No events.

## Examples

```typescript
// Example usage of PsRouter
const router = new PsRouter();
router.hostConnected(); // Call this method to set up the router when the host is connected.
// ... later on, when the host is disconnected
router.hostDisconnected(); // Call this method to clean up the router.
```

Please note that the `_onClick` and `_onPopState` methods are private and are not intended to be called directly. They are used internally by the `PsRouter` class to handle navigation events.