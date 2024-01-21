# CpsSubProblems

`CpsSubProblems` is a custom web component that extends `CpsStageBase` and is responsible for rendering and managing sub-problems within a larger problem-solving context. It provides functionality to open and close sub-problems, render lists of sub-problems, and display individual sub-problem screens with associated search queries and results.

## Properties

| Name                   | Type   | Description               |
|------------------------|--------|---------------------------|
| activeSubProblemIndex  | number \| null | The index of the currently active sub-problem. |

## Methods

| Name                  | Parameters                                  | Return Type | Description                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------|
| connectedCallback     | -                                           | void        | Lifecycle method called when the component is added to the DOM. It initializes component state and logs an activity. |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method called after the component's properties have been updated. |
| disconnectedCallback  | -                                           | void        | Lifecycle method called when the component is removed from the DOM. It logs an activity. |
| render                | -                                           | unknown     | Renders the component based on the current state, either a list of sub-problems or a single sub-problem screen. |
| renderSubProblemScreen| subProblem: IEngineSubProblem               | unknown     | Renders the screen for a single sub-problem, including search queries and results. |
| renderSubProblemList  | subProblems: IEngineSubProblem[], title: string | unknown     | Renders a list of sub-problems with a given title. |

## Events

- **No custom events are defined in this component.**

## Examples

```typescript
// Example usage of the CpsSubProblems component
<yps-sub-problems></yps-sub-problems>
```

Please note that the actual usage of the component would depend on the context within which it is used, including the data passed to it and the surrounding application logic.