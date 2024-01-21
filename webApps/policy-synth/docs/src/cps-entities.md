# CpsEntities

CpsEntities is a custom element that extends the functionality of CpsStageBase. It is responsible for rendering and managing the UI related to entities within a problem-solving context. The class handles the display of sub-problems and their associated entities, including their positive and negative effects, and integrates with search queries and results.

## Properties

| Name               | Type                | Description                                      |
|--------------------|---------------------|--------------------------------------------------|
| activeEntityIndex  | number \| null      | The index of the currently active entity.        |
| maxNumberOfTopEntities | number          | The maximum number of top entities to display.   |

## Methods

| Name                 | Parameters                                  | Return Type | Description                                                                 |
|----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback    |                                             | void        | Lifecycle method that runs when the element is added to the DOM.            |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the element's properties have changed.      |
| disconnectedCallback |                                             | void        | Lifecycle method that runs when the element is removed from the DOM.         |
| render               |                                             | unknown     | Renders the element's HTML template.                                        |
| renderSubProblemScreen | subProblem: IEngineSubProblem             | unknown     | Renders the screen for a specific sub-problem.                               |
| renderEntityScreen   | entity: IEngineAffectedEntity              | unknown     | Renders the screen for a specific entity.                                    |

## Events

- **None specified**

## Examples

```typescript
// Example usage of the CpsEntities custom element
import 'path-to-components/cps-entities.js';

// Assuming you have a CpsEntities element in your HTML with an id of 'entities'
const cpsEntitiesElement = document.getElementById('entities');

// You can interact with the CpsEntities element using its properties and methods
// For example, to set the active entity index:
cpsEntitiesElement.activeEntityIndex = 2;

// To trigger a re-render after updating properties:
cpsEntitiesElement.requestUpdate();
```

Note: The `IEngineSubProblem` and `IEngineAffectedEntity` types are not defined within the provided code snippet. They should be defined elsewhere in the codebase, and their structure would need to be documented separately.