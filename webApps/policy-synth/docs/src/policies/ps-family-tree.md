# PsFamilyTree

The `PsFamilyTree` class is a custom web component that extends the `YpBaseElement` class. It is designed to visualize the family tree of solutions within an evolutionary algorithm context. The component displays the relationships between solutions, including parent-child relationships, mutation rates, and seed URLs.

## Properties

| Name             | Type                             | Description                                                                 |
|------------------|----------------------------------|-----------------------------------------------------------------------------|
| memory           | IEngineInnovationMemoryData      | The memory data of the engine innovation, containing the family tree data.  |
| subProblemIndex  | number                           | The index of the sub-problem within the memory data to visualize.           |
| solution         | IEngineSolution                  | The solution data to be visualized as the root of the family tree.          |

## Methods

| Name                  | Parameters        | Return Type | Description                                                                                   |
|-----------------------|-------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback     |                   | void        | Lifecycle method that runs when the component is added to the DOM.                            |
| disconnectedCallback  |                   | void        | Lifecycle method that runs when the component is removed from the DOM.                         |
| getParentSolution     | parent: string    | IEngineSolution | Retrieves the parent solution based on the provided identifier.                               |
| renderFamilyTree      | currentSolution: IEngineSolution, first: boolean, isMutatedFrom: boolean | TemplateResult | Renders the family tree structure for the given solution, marking the first and mutated solutions. |
| render                |                   | TemplateResult | Renders the family tree component with the title and the root solution's family tree.         |

## Events

- No custom events are emitted by this component.

## Examples

```typescript
// Example usage of the PsFamilyTree web component
import { PsFamilyTree } from './path-to-ps-family-tree';

// Assuming 'memoryData' is an instance of IEngineInnovationMemoryData and 'solutionData' is an instance of IEngineSolution
const familyTreeElement = document.createElement('ps-family-tree') as PsFamilyTree;
familyTreeElement.memory = memoryData;
familyTreeElement.subProblemIndex = 0; // Index of the sub-problem to visualize
familyTreeElement.solution = solutionData; // Root solution to start the family tree from

document.body.appendChild(familyTreeElement);
```

Note: The `IEngineInnovationMemoryData` and `IEngineSolution` types should be defined elsewhere in the codebase, as they are not included within the provided snippet.