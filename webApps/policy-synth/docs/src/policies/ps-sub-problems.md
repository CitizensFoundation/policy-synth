# PsSubProblems

`PsSubProblems` is a custom web component that extends `PsStageBase`. It is responsible for managing and displaying sub-problems within a problem-solving application. The component allows users to view a list of sub-problems and interact with individual sub-problem screens, which include search queries and search results related to the sub-problem.

## Properties

| Name                   | Type   | Description               |
|------------------------|--------|---------------------------|
| activeSubProblemIndex  | number | The index of the currently active sub-problem. |

## Methods

| Name                  | Parameters                                  | Return Type | Description                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------|
| connectedCallback     | -                                           | void        | Lifecycle method called when the component is added to the DOM. It initializes component state and sets up any necessary event listeners. |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component's properties have been updated. |
| disconnectedCallback  | -                                           | void        | Lifecycle method called when the component is removed from the DOM. It performs cleanup tasks. |
| render                | -                                           | unknown     | Renders the component's HTML template. |
| renderSubProblemScreen| subProblem: IEngineSubProblem               | unknown     | Renders the screen for an individual sub-problem. |
| renderSubProblemList  | subProblems: IEngineSubProblem[], title: string | unknown | Renders the list of sub-problems with a given title. |

## Events

- **No custom events are defined in this component.**

## Examples

```typescript
// Example usage of the PsSubProblems component
<ps-sub-problems></ps-sub-problems>
```

Please note that the `IEngineSubProblem` type is referenced in the methods but is not defined in the provided code snippet. You would need to refer to the corresponding interface definition to understand the structure of the sub-problem objects being used.