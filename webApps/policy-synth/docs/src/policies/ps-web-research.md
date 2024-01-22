# PsWebResearch

PsWebResearch is a custom web component that extends the PsStageBase class. It is responsible for rendering the web research stage of a problem-solving application. The component displays problem statements, search queries, search results, and entities related to sub-problems.

## Properties

| Name                   | Type   | Description                                           |
|------------------------|--------|-------------------------------------------------------|
| maxNumberOfTopEntities | number | The maximum number of top entities to be displayed.   |

## Methods

| Name                | Parameters                                  | Return Type | Description                                                                 |
|---------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   | -                                           | void        | Lifecycle method that runs when the component is added to the DOM.          |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties have changed.    |
| disconnectedCallback| -                                           | void        | Lifecycle method that runs when the component is removed from the DOM.      |
| render              | -                                           | TemplateResult | Renders the HTML template for the component.                                |
| renderEntities      | subProblem: IEngineSubProblem               | TemplateResult | Renders the entities associated with a given sub-problem.                   |
| renderSubProblemsWithAll | -                                       | TemplateResult | Renders all sub-problems with their associated entities, search queries, and results. |

## Events

- No custom events are emitted by this component.

## Examples

```typescript
// Example usage of the PsWebResearch component
import { PsWebResearch } from './path-to-ps-web-research';

// Assuming 'ps-web-research' is registered as a custom element and 'memory' is an object with the required structure
<ps-web-research .memory=${memory}></ps-web-research>
```

Note: The actual usage of the component would depend on the context within a larger application, and the example assumes that the necessary imports and context are provided.