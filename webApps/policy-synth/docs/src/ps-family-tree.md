# PsFamilyTree

`PsFamilyTree` is a custom web component that extends `YpBaseElement` to display an evolutionary tree of solutions. It visualizes the relationships between different solutions in a family tree-like structure, highlighting the parent-child relationships, mutation rates, and seed URLs.

## Properties

| Name             | Type                           | Description                                                                 |
|------------------|--------------------------------|-----------------------------------------------------------------------------|
| memory           | IEngineInnovationMemoryData    | The memory data containing information about subproblems and their solutions. |
| subProblemIndex  | number                         | The index of the current subproblem within the memory data.                 |
| solution         | IEngineSolution                | The solution data for the current node in the family tree.                  |

## Methods

| Name               | Parameters                  | Return Type | Description                                                                 |
|--------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback  | none                        | void        | Lifecycle method that runs when the component is added to the DOM.          |
| disconnectedCallback | none                        | void        | Lifecycle method that runs when the component is removed from the DOM.       |
| getParentSolution | parent: string              | IEngineSolution | Retrieves the parent solution based on a given identifier.                  |
| renderFamilyTree  | currentSolution: IEngineSolution, first: boolean = false, isMutatedFrom: boolean = false | any | Renders the family tree structure for a given solution.                     |
| render            | none                        | TemplateResult | Renders the component's HTML template.                                      |

## Events

- **No custom events are defined in this component.**

## Examples

```typescript
// Example usage of the PsFamilyTree component
<ps-family-tree .memory=${memoryData} .subProblemIndex=${index} .solution=${solutionData}></ps-family-tree>
```

Please note that the actual usage may vary depending on the context within which the component is used, including how the properties are set and managed.