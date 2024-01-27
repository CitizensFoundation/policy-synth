# PsFamilyTree

`PsFamilyTree` is a custom web component that extends `YpBaseElement` to display a family tree visualization for solutions within an evolutionary algorithm context. It visualizes the relationships between solutions, including parentage and mutation rates, and provides an interactive way to explore the evolution of solutions over generations.

## Properties

| Name             | Type                             | Description                                                                 |
|------------------|----------------------------------|-----------------------------------------------------------------------------|
| memory           | IEngineInnovationMemoryData      | The memory object containing data about the evolutionary process.          |
| subProblemIndex  | number                           | The index of the sub-problem within the evolutionary process being viewed. |
| solution         | IEngineSolution                  | The current solution for which the family tree is being rendered.          |

## Methods

| Name              | Parameters                  | Return Type      | Description                                                                                   |
|-------------------|-----------------------------|------------------|-----------------------------------------------------------------------------------------------|
| connectedCallback |                             | void             | Lifecycle method that runs when the component is added to the document's DOM.                |
| disconnectedCallback |                         | void             | Lifecycle method that runs when the component is removed from the document's DOM.            |
| getParentSolution | parent: string              | IEngineSolution  | Retrieves the parent solution based on a given parent identifier.                            |
| renderFamilyTree  | currentSolution: IEngineSolution, first: boolean = false, isMutatedFrom: boolean = false | TemplateResult | Renders the family tree structure for a given solution.                                       |
| render            |                             | TemplateResult   | Renders the component's HTML template.                                                       |

## Events

None.

## Example

```typescript
import '@policysynth/webapp/policies/ps-family-tree.js';

// Assuming you have an instance of PsFamilyTree in your HTML
const psFamilyTreeElement = document.querySelector('ps-family-tree');

// Setting the memory, subProblemIndex, and solution properties
psFamilyTreeElement.memory = yourMemoryData;
psFamilyTreeElement.subProblemIndex = yourSubProblemIndex;
psFamilyTreeElement.solution = yourSolutionData;

// The component will automatically render the family tree based on the provided data.
```

This example demonstrates how to use the `PsFamilyTree` component within a web application. It involves importing the component, selecting it from the DOM, and setting its properties with relevant data from the evolutionary algorithm's process. The component then visualizes the family tree for the specified solution.