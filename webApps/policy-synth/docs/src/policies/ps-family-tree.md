# PsFamilyTree

`PsFamilyTree` is a custom element that extends `YpBaseElement` to display a family tree visualization for solutions in an evolutionary algorithm context. It uses LitElement for rendering and property management.

## Properties

| Name             | Type                             | Description                                                                 |
|------------------|----------------------------------|-----------------------------------------------------------------------------|
| memory           | IEngineInnovationMemoryData      | Holds the memory data related to the engine's innovation process.           |
| subProblemIndex  | number                           | Index of the current sub-problem being visualized in the family tree.       |
| solution         | IEngineSolution                  | The solution for which the family tree is being visualized.                 |

## Methods

| Name               | Parameters                  | Return Type       | Description                                                                                   |
|--------------------|-----------------------------|-------------------|-----------------------------------------------------------------------------------------------|
| connectedCallback  | -                           | void              | Lifecycle method that runs when the element is added to the document's DOM.                   |
| disconnectedCallback | -                         | void              | Lifecycle method that runs when the element is removed from the document's DOM.               |
| getParentSolution  | parent: string              | IEngineSolution   | Retrieves the parent solution based on a given parent string identifier.                      |
| renderFamilyTree   | currentSolution: IEngineSolution, first: boolean = false, isMutatedFrom: boolean = false | TemplateResult | Renders the family tree structure for a given solution, including its parents and mutation information. |
| render             | -                           | TemplateResult    | Renders the main content of the family tree visualization.                                     |

## Events

No custom events are defined in this class.

## Example

```typescript
import '@policysynth/webapp/policies/ps-family-tree.js';

// Usage in a LitElement template
html`
  <ps-family-tree .memory=${this.memoryData} .subProblemIndex=${0} .solution=${this.solution}></ps-family-tree>
`;
```

This example demonstrates how to use the `ps-family-tree` custom element within a LitElement-based component. It assumes that `this.memoryData` and `this.solution` are properties of the parent component that contain the necessary data to visualize the family tree.