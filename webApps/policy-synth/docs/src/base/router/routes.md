# Routes

A reactive controller that performs location-based routing using a configuration of URL patterns and associated render callbacks.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| routes      | Array<RouteConfig>        | The currently installed set of routes in precedence order.                  |
| fallback    | BaseRouteConfig \| undefined | A default fallback route which will always be matched if none of the routes match. |

## Methods

| Name       | Parameters            | Return Type | Description                                                                 |
|------------|-----------------------|-------------|-----------------------------------------------------------------------------|
| link       | pathname?: string     | string      | Returns a URL string of the current route, including parent routes.         |
| goto       | pathname: string      | Promise<void> | Navigates this routes controller to `pathname`.                            |
| outlet     | -                     | unknown     | The result of calling the current route's render() callback.                |
| params     | -                     | {[key: string]: string \| undefined} | The current parsed route parameters.                                       |
| hostConnected | -                 | void        | Lifecycle method called when the controller's host is connected.            |
| hostDisconnected | -             | void        | Lifecycle method called when the controller's host is disconnected.         |

## Events

- **lit-routes-connected**: Fired from Routes controllers when their host is connected to announce the child route and potentially connect to a parent routes controller.

## Examples

```typescript
// Example usage of Routes
const routes = new Routes(hostElement, [
  {
    path: '/home',
    render: () => html`<home-page></home-page>`,
  },
  {
    path: '/about',
    render: () => html`<about-page></about-page>`,
  },
]);

// Navigate to a specific route
routes.goto('/home');

// Get the current route's URL
const currentUrl = routes.link();

// Get the current route's parameters
const params = routes.params;

// Render the current route's content
const content = routes.outlet();
```

# RouteConfig

A description of a route, which path or pattern to match against, and a render() callback used to render a match to the outlet.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| name        | string \| undefined       | Optional name for the route.                                                |
| render      | ((params: {[key: string]: string \| undefined}) => unknown) \| undefined | Optional render callback for the route.                                     |
| enter       | ((params: {[key: string]: string \| undefined}) => Promise<boolean> \| boolean) \| undefined | Optional enter callback for the route.                                      |
| path        | string                    | Pathname pattern to match against (only for PathRouteConfig).               |
| pattern     | URLPattern                | URLPattern to match against (only for URLPatternRouteConfig).               |

## Examples

```typescript
// Example usage of RouteConfig
const pathRouteConfig: PathRouteConfig = {
  name: 'home',
  path: '/home',
  render: (params) => html`<home-page></home-page>`,
};

const urlPatternRouteConfig: URLPatternRouteConfig = {
  name: 'about',
  pattern: new URLPattern({ pathname: '/about' }),
  render: (params) => html`<about-page></about-page>`,
};
```

# BaseRouteConfig

Base configuration for a route.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| name        | string \| undefined       | Optional name for the route.                                                |
| render      | ((params: {[key: string]: string \| undefined}) => unknown) \| undefined | Optional render callback for the route.                                     |
| enter       | ((params: {[key: string]: string \| undefined}) => Promise<boolean> \| boolean) \| undefined | Optional enter callback for the route.                                      |

# PathRouteConfig

A RouteConfig that matches against a `path` string.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| path        | string                    | Pathname pattern to match against.                                          |

# URLPatternRouteConfig

A RouteConfig that matches against a given `URLPattern`.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| pattern     | URLPattern                | URLPattern to match against.                                                |

# RoutesConnectedEvent

This event is fired from Routes controllers when their host is connected.

## Properties

| Name        | Type                      | Description                                                                 |
|-------------|---------------------------|-----------------------------------------------------------------------------|
| routes      | Routes                    | The Routes instance associated with the event.                              |
| onDisconnect| (() => void) \| undefined | Callback to call when the Routes instance is disconnected.                  |

## Examples

```typescript
// Example usage of RoutesConnectedEvent
hostElement.addEventListener(RoutesConnectedEvent.eventName, (event) => {
  // Handle the event
});
```