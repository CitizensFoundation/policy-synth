# CpsProblemStatement

The `CpsProblemStatement` class is a custom element that extends the `CpsStageBase` class. It is responsible for rendering the problem statement section within a collaborative problem-solving application. It includes functionality to handle the component's lifecycle events and render the problem statement, search queries, and search results.

## Properties

No public properties are documented.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |                                             | void        | Lifecycle method that is called when the component is added to the document. |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that is called after the component's properties have changed. |
| disconnectedCallback  |                                             | void        | Lifecycle method that is called when the component is removed from the document. |
| render                |                                             | unknown     | Renders the problem statement, search queries, and search results.           |

## Events

No custom events are documented.

## Examples

```typescript
// Example usage of the CpsProblemStatement custom element
<yps-problem-statement></yps-problem-statement>
```

Please note that the actual usage may require additional context or initialization not provided in this example.