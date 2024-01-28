# PolicySynthApiApp

This class initializes and starts the PolicySynth API application server with specified controllers and a port.

## Properties

No properties are documented for this class.

## Methods

| Name    | Parameters                                         | Return Type | Description                                      |
|---------|----------------------------------------------------|-------------|--------------------------------------------------|
| listen  | None                                               | void        | Starts the server and listens for incoming requests. |

## Examples

```typescript
import { PolicySynthApiApp } from '@policysynth/apiserver/app.js';
import { AnalyticsController } from '@policysynth/apiserver/controllers/analyticsController.js';
import { ProjectsController } from '@policysynth/apiserver/controllers/projectsController.js';
import { TreeController } from '@policysynth/apiserver/controllers/treeController.js';

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

Handles API requests related to analytics.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Examples

```typescript
import { AnalyticsController } from '@policysynth/apiserver/controllers/analyticsController.js';

// Example usage within the PolicySynthApiApp initialization
```

# ProjectsController

Manages API requests concerning projects.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Examples

```typescript
import { ProjectsController } from '@policysynth/apiserver/controllers/projectsController.js';

// Example usage within the PolicySynthApiApp initialization
```

# TreeController

Deals with API requests for tree data structures.

## Properties

No properties are documented for this class.

## Methods

No methods are documented for this class.

## Examples

```typescript
import { TreeController } from '@policysynth/apiserver/controllers/treeController.js';

// Example usage within the PolicySynthApiApp initialization
```