# CpsEntities

CpsEntities is a custom element that extends the functionality of CpsStageBase. It is responsible for rendering and managing the UI related to entities within a problem-solving context. It allows users to view and interact with sub-problems and their associated entities, including their negative and positive effects, search queries, and search results.

## Properties

| Name               | Type                | Description                                                                 |
|--------------------|---------------------|-----------------------------------------------------------------------------|
| activeEntityIndex  | number \| null      | The index of the currently active entity, or null if no entity is selected. |
| maxNumberOfTopEntities | number          | The maximum number of top entities to display prominently.                  |

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |                                             | void        | Lifecycle method that runs when the element is added to the DOM.            |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the element's properties have changed.      |
| disconnectedCallback  |                                             | void        | Lifecycle method that runs when the element is removed from the DOM.         |
| render                |                                             | unknown     | Renders the element's HTML template.                                        |
| renderSubProblemScreen| subProblem: IEngineSubProblem               | unknown     | Renders the screen for a specific sub-problem.                               |
| renderEntityScreen    | entity: IEngineAffectedEntity               | unknown     | Renders the screen for a specific entity.                                    |

## Events

- **None specified**

## Examples

```typescript
// Example usage of the CpsEntities custom element
import 'path-to-component/cps-entities.js';

// Assuming you have an instance of the element in your HTML or you create one dynamically
const cpsEntitiesElement = document.querySelector('cps-entities');

// You can set the activeEntityIndex to display a specific entity
cpsEntitiesElement.activeEntityIndex = 2;

// You can also set the maxNumberOfTopEntities to control how many entities are displayed prominently
cpsEntitiesElement.maxNumberOfTopEntities = 3;
```

**Note:** The `IEngineSubProblem` and `IEngineAffectedEntity` types are not defined within the provided code snippet. They should be defined elsewhere in the application and imported into the component where necessary.