# CpsProblemStatement

The `CpsProblemStatement` class is a custom element that extends `CpsStageBase`. It is responsible for rendering and managing the problem statement stage within a larger application flow. This class includes lifecycle callbacks for when the component is connected and disconnected, as well as rendering logic for the problem statement and related search queries and results.

## Properties

No public properties are defined in this class beyond those inherited from `CpsStageBase`.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |                                             | void        | Lifecycle callback that runs when the component is added to the DOM.        |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle callback that runs when the component's properties have changed.  |
| disconnectedCallback  |                                             | void        | Lifecycle callback that runs when the component is removed from the DOM.    |
| render                |                                             | unknown     | Renders the problem statement, search queries, and search results.          |

## Events

No custom events are emitted by this class.

## Examples

```typescript
// Example usage of the CpsProblemStatement web component
<yps-common-cps-problem-statement></yps-common-cps-problem-statement>
```

Please note that the actual usage may vary depending on the context within the application and the required attributes or properties that need to be passed to the component.