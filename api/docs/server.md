# PolicySynthApiApp

This class initializes and starts the PolicySynth API application with specified controllers and a port.

## Properties

No properties documented.

## Methods

| Name    | Parameters                                         | Return Type | Description                                      |
|---------|----------------------------------------------------|-------------|--------------------------------------------------|
| listen  | None                                               | void        | Starts the server and listens on the given port. |

## Examples

```javascript
import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import { ProjectsController } from '@policysynth/api/controllers/projectsController.js';
import { TreeController } from '@policysynth/api/controllers/treeController.js';

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

Handles analytics-related routes in the PolicySynth API.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```javascript
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';

// Example usage within PolicySynthApiApp initialization
const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    // other controllers
  ],
  8000,
);
```

# ProjectsController

Manages project-related operations within the PolicySynth API.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```javascript
import { ProjectsController } from '@policysynth/api/controllers/projectsController.js';

// Example usage within PolicySynthApiApp initialization
const app = new PolicySynthApiApp(
  [
    ProjectsController,
    // other controllers
  ],
  8000,
);
```

# TreeController

Responsible for tree structure operations in the PolicySynth API.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```javascript
import { TreeController } from '@policysynth/api/controllers/treeController.js';

// Example usage within PolicySynthApiApp initialization
const app = new PolicySynthApiApp(
  [
    TreeController,
    // other controllers
  ],
  8000,
);
```