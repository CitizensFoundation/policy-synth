# PsRouter

A root-level router that installs global event listeners to intercept navigation. This class extends Routes so that it can also have a route configuration. There should only be one Router instance on a page, since the Router installs global event listeners on `window` and `document`. Nested routes should be configured with the `Routes` class.

## Properties

No public properties are documented for this class.

## Methods

| Name              | Parameters        | Return Type | Description                                                                                   |
|-------------------|-------------------|-------------|-----------------------------------------------------------------------------------------------|
| hostConnected     | -                 | void        | Overrides the `hostConnected` method to add event listeners for click and popstate events.   |
| hostDisconnected  | -                 | void        | Overrides the `hostDisconnected` method to remove event listeners for click and popstate events. |
| _onClick          | e: MouseEvent     | void        | Private method to handle click events and navigate accordingly.                              |
| _onPopState       | _e: PopStateEvent | void        | Private method to handle popstate events and navigate to the current URL path.               |

## Events

No events are documented for this class.

## Example

```typescript
import { PsRouter } from '@policysynth/webapp/base/router/router.js';

// Example of creating a new PsRouter instance
const router = new PsRouter();

// Assuming `Routes` class has been properly configured with routes,
// PsRouter will handle navigation through global event listeners.
```

This example demonstrates how to import and potentially instantiate a `PsRouter` class. Note that the actual route configuration and usage would depend on the setup of the `Routes` class and the specific needs of your application.