# Routes

A reactive controller that performs location-based routing using a configuration of URL patterns and associated render callbacks.

## Properties

| Name          | Type                                      | Description |
|---------------|-------------------------------------------|-------------|
| routes        | Array<RouteConfig>                        | The currently installed set of routes in precedence order. |
| fallback      | BaseRouteConfig \| undefined              | A default fallback route which will always be matched if none of the routes match. |

## Methods

| Name            | Parameters                          | Return Type | Description |
|-----------------|-------------------------------------|-------------|-------------|
| link            | pathname?: string                   | string      | Returns a URL string of the current route, including parent routes, optionally replacing the local path with `pathname`. |
| goto            | pathname: string                    | Promise<void> | Navigates this routes controller to `pathname`. |
| outlet          |                                     | unknown     | The result of calling the current route's render() callback. |
| params          |                                     | {[key: string]: string \| undefined} | The current parsed route parameters. |
| hostConnected   |                                     | void        | Callback to call when this controller is connected. |
| hostDisconnected|                                     | void        | Callback to call when this controller is disconnected. |

## Events

## Example

```typescript
import { Routes, RouteConfig, BaseRouteConfig } from '@policysynth/webapp/base/router/routes.js';

const routes: Array<RouteConfig> = [
  {
    path: '/home',
    render: (params) => `Render Home with params: ${JSON.stringify(params)}`,
  },
  {
    path: '/about',
    render: (params) => `Render About with params: ${JSON.stringify(params)}`,
  },
];

const fallback: BaseRouteConfig = {
  render: () => `Render Fallback`,
};

const routesController = new Routes(document.body, routes, { fallback });

// Example of navigating to a route
routesController.goto('/home').then(() => {
  console.log('Navigation to /home completed');
});
```

# BaseRouteConfig

Interface for basic route configuration.

## Properties

| Name   | Type                                            | Description |
|--------|-------------------------------------------------|-------------|
| name   | string \| undefined                             | Optional name for the route. |
| render | (params: {[key: string]: string \| undefined}) => unknown | Optional render function for the route. |
| enter  | (params: {[key: string]: string \| undefined}) => Promise<boolean> \| boolean | Optional enter function that can prevent navigation if it returns false. |

# PathRouteConfig

A RouteConfig that matches against a `path` string.

## Properties

| Name   | Type   | Description |
|--------|--------|-------------|
| path   | string | A `URLPattern` compatible pathname pattern. |

Inherits properties from `BaseRouteConfig`.

# URLPatternRouteConfig

A RouteConfig that matches against a given `URLPattern`.

## Properties

| Name    | Type       | Description |
|---------|------------|-------------|
| pattern | URLPattern | The URLPattern to match against. |

Inherits properties from `BaseRouteConfig`.

# RoutesConnectedEvent

Event fired from Routes controllers when their host is connected to announce the child route and potentially connect to a parent routes controller.

## Properties

| Name         | Type       | Description |
|--------------|------------|-------------|
| routes       | Routes     | The Routes instance that fired the event. |
| onDisconnect | () => void | Optional callback to call when the event source is disconnected. |

## Example

```typescript
document.body.addEventListener(RoutesConnectedEvent.eventName, (event) => {
  console.log('Routes connected:', event.routes);
});
```