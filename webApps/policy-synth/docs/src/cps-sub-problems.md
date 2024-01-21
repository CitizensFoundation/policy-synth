# CpsSubProblems

`CpsSubProblems` is a custom web component that extends `CpsStageBase` and is responsible for rendering and managing sub-problems within a larger problem-solving context. It provides functionality to open and close sub-problems, render lists of sub-problems, and display individual sub-problem screens with associated search queries and results.

## Properties

No public properties are documented.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |                                             | void        | Lifecycle method that runs when the component is added to the DOM.          |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties have changed.    |
| disconnectedCallback  |                                             | void        | Lifecycle method that runs when the component is removed from the DOM.      |
| render                |                                             | unknown     | Renders the component based on the current state.                           |
| renderSubProblemScreen| subProblem: IEngineSubProblem              | unknown     | Renders the screen for a specific sub-problem.                              |

## Events

No events are documented.

## Examples

```typescript
// Example usage of the CpsSubProblems component
<yps-sub-problems></yps-sub-problems>
```

Please note that the actual properties, events, and methods may not be fully documented here as the provided code snippet does not include all the necessary information. The `IEngineSubProblem` type is also not defined in the provided snippet, so its structure is unknown.