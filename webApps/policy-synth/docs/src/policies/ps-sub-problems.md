# PsSubProblems

`PsSubProblems` is a custom element that extends `PsStageBase` to manage and display sub-problems within a policy synthesis process. It handles the lifecycle events such as connection and disconnection from the DOM and renders the sub-problems or a specific sub-problem detail view based on the active sub-problem index.

## Properties

No public properties are explicitly defined in this class beyond those inherited from `PsStageBase`.

## Methods

| Name                   | Parameters                                        | Return Type | Description                                                                                   |
|------------------------|---------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback      |                                                   | void        | Lifecycle method that runs when the element is added to the DOM. Logs activity opening.      |
| updated                | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties change.                              |
| disconnectedCallback   |                                                   | void        | Lifecycle method that runs when the element is removed from the DOM. Logs activity closing.  |
| render                 |                                                   | unknown     | Renders the sub-problems list or a specific sub-problem detail view based on the active index.|
| renderSubProblemScreen | subProblem: IEngineSubProblem                     | unknown     | Renders the detailed view of a specific sub-problem.                                          |

## Events

No custom events are emitted by this class.

## Example

```typescript
import '@policysynth/webapp/policies/ps-sub-problems.js';

// Usage in a LitElement template
html`
  <ps-sub-problems></ps-sub-problems>
`;
```

Note: The `IEngineSubProblem` type referenced in the `renderSubProblemScreen` method is not defined in the provided code snippet. It is assumed to be an interface representing the structure of a sub-problem, including properties like `searchQueries` and `searchResults` used in the rendering methods.