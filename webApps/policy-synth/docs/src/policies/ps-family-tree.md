# PsFamilyTree

PsFamilyTree is a custom web component that extends YpBaseElement to display a family tree structure representing the evolution of solutions within an engine. It visualizes the relationships between different solutions, including parent-child relationships, mutation rates, and seed URLs.

## Properties

| Name             | Type                           | Description                                                                 |
|------------------|--------------------------------|-----------------------------------------------------------------------------|
| memory           | IEngineInnovationMemoryData    | The memory data from the engine innovation containing subproblems and solutions. |
| subProblemIndex  | number                         | The index of the current subproblem within the memory data.                 |
| solution         | IEngineSolution                | The current solution being displayed in the family tree.                    |

## Methods

| Name                | Parameters        | Return Type | Description                                                                 |
|---------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   | none              | void        | Lifecycle method that runs when the component is added to the DOM.          |
| disconnectedCallback| none              | void        | Lifecycle method that runs when the component is removed from the DOM.      |
| getParentSolution   | parent: string    | IEngineSolution | Retrieves the parent solution based on a given identifier.                 |
| renderFamilyTree    | currentSolution: IEngineSolution, first: boolean, isMutatedFrom: boolean | TemplateResult | Renders the family tree structure for a given solution. |
| render              | none              | TemplateResult | Renders the component's HTML template.                                      |

## Events

- **None**

## Examples

```typescript
// Example usage of the PsFamilyTree component
import { PsFamilyTree } from './path-to-ps-family-tree';

// Assuming 'memoryData' is an instance of IEngineInnovationMemoryData and 'solutionData' is an instance of IEngineSolution
const familyTreeElement = document.createElement('ps-family-tree') as PsFamilyTree;
familyTreeElement.memory = memoryData;
familyTreeElement.subProblemIndex = 0; // Index of the subproblem
familyTreeElement.solution = solutionData;

document.body.appendChild(familyTreeElement);
```

Please note that the actual usage may vary depending on the context in which the component is used, and the example assumes that the necessary data types (`IEngineInnovationMemoryData` and `IEngineSolution`) are defined and instances are available.