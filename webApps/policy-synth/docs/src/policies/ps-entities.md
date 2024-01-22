# PsEntities

`PsEntities` is a custom web component that extends `PsStageBase` and is responsible for rendering and managing sub-problems and entities within a problem-solving application. It allows users to view and interact with sub-problems and their associated entities, including their negative and positive effects, search queries, and search results.

## Properties

| Name               | Type                  | Description                                           |
|--------------------|-----------------------|-------------------------------------------------------|
| activeEntityIndex  | number \| null        | The index of the currently active entity, if any.     |
| maxNumberOfTopEntities | number            | The maximum number of top entities to display.        |

## Methods

| Name                 | Parameters                                  | Return Type | Description                                             |
|----------------------|---------------------------------------------|-------------|---------------------------------------------------------|
| connectedCallback    |                                             | void        | Lifecycle method called when the component is connected to the DOM. |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called when the component's properties have changed. |
| disconnectedCallback |                                             | void        | Lifecycle method called when the component is disconnected from the DOM. |
| render               |                                             | unknown     | Renders the component based on the current state.        |
| renderSubProblemScreen | subProblem: IEngineSubProblem             | unknown     | Renders the screen for a specific sub-problem.           |
| renderEntityScreen   | entity: IEngineAffectedEntity              | unknown     | Renders the screen for a specific entity.                |

## Events

- **No custom events are defined in this component.**

## Examples

```typescript
// Example usage of the PsEntities component
<ps-entities></ps-entities>
```

**Note:** The actual usage of the component would depend on the context within the application where it is integrated. The component relies on properties and methods inherited from `PsStageBase` and expects certain data structures like `IEngineSubProblem` and `IEngineAffectedEntity` to be defined elsewhere in the application.