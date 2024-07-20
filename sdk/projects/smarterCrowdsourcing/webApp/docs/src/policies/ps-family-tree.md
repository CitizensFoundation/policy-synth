# PsFamilyTree

`PsFamilyTree` is a custom web component that extends `YpBaseElement` to display a family tree visualization for solutions in a problem-solving environment. It uses LitElement for rendering and supports dynamic updates based on the provided memory and solution data.

## Properties

| Name             | Type                | Description                                                                 |
|------------------|---------------------|-----------------------------------------------------------------------------|
| memory           | PsSmarterCrowdsourcingMemoryData    | The memory data containing information about subproblems and their solutions. |
| subProblemIndex  | number              | The index of the current subproblem within the memory's subproblems list.   |
| solution         | PsSolution     | The solution data for which the family tree is being visualized.            |

## Methods

| Name               | Parameters                  | Return Type       | Description                                                                                   |
|--------------------|-----------------------------|-------------------|-----------------------------------------------------------------------------------------------|
| connectedCallback  | -                           | void              | Lifecycle method that runs when the component is added to the document's DOM.                 |
| disconnectedCallback | -                         | void              | Lifecycle method that runs when the component is removed from the document's DOM.             |
| getParentSolution  | parent: string              | PsSolution   | Retrieves the parent solution based on the provided parent string identifier.                 |
| renderFamilyTree   | currentSolution: PsSolution, first: boolean = false, isMutatedFrom: boolean = false | TemplateResult | Renders the family tree structure for the given solution, marking the first and mutation origins. |
| render             | -                           | TemplateResult    | Renders the component's HTML structure, including the family tree visualization.              |

## Events

None.

## Example

```typescript
import '@policysynth/webapp/policies/ps-family-tree.js';

// Assuming you have a LitElement or similar where you can use this component
html`
  <ps-family-tree
    .memory=${yourMemoryData}
    .subProblemIndex=${yourSubProblemIndex}
    .solution=${yourSolutionData}
  ></ps-family-tree>
`;
```

This example demonstrates how to use the `ps-family-tree` component within a LitElement-based application. You need to provide it with the necessary `memory`, `subProblemIndex`, and `solution` data for it to visualize the family tree of solutions.