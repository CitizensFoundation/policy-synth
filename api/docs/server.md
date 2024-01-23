# PolicySynthApiApp

The `PolicySynthApiApp` class is responsible for initializing and starting the API application with the specified controllers and port number.

## Properties

No properties are documented for this class.

## Methods

| Name    | Parameters                                  | Return Type | Description                             |
|---------|---------------------------------------------|-------------|-----------------------------------------|
| listen  | -                                           | void        | Starts the application on the given port|

## Routes

No routes are documented for this class.

## Examples

```typescript
// Example usage to start the PolicySynthApiApp
import { PolicySynthApiApp } from './app.js';
import { ProjectsController } from './controllers/projectsController.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { TreeController } from './controllers/treeController.js';

const app = new PolicySynthApiApp(
  [
    ProjectsController,
    AnalyticsController,
    TreeController,
  ],
  8000,
);

app.listen();
```

# AnalyticsController

The `AnalyticsController` class handles API routes related to analytics operations.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Routes

The specific routes for `AnalyticsController` are not provided in the input.

## Examples

```typescript
// Example usage of AnalyticsController within the PolicySynthApiApp
const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    // ... other controllers
  ],
  8000,
);

app.listen();
```

# ProjectsController

The `ProjectsController` class manages API routes related to project operations.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Routes

The specific routes for `ProjectsController` are not provided in the input.

## Examples

```typescript
// Example usage of ProjectsController within the PolicySynthApiApp
const app = new PolicySynthApiApp(
  [
    ProjectsController,
    // ... other controllers
  ],
  8000,
);

app.listen();
```

# TreeController

The `TreeController` class is responsible for handling API routes associated with tree data structures.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Routes

The specific routes for `TreeController` are not provided in the input.

## Examples

```typescript
// Example usage of TreeController within the PolicySynthApiApp
const app = new PolicySynthApiApp(
  [
    TreeController,
    // ... other controllers
  ],
  8000,
);

app.listen();
```

Please note that the actual implementation details such as properties, methods, and routes for the controllers (`AnalyticsController`, `ProjectsController`, `TreeController`) are not provided in the input. For complete documentation, the implementation of these classes would need to be provided.