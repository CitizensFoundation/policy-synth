# PsWebResearch

`PsWebResearch` is a custom element that extends `PsStageBase` to provide functionality for web research within a policy synthesis platform. It is designed to render and manage the display of problem statements, search queries, search results, and entities related to sub-problems in the context of automated web research.

## Properties

| Name                   | Type   | Description                                                                 |
|------------------------|--------|-----------------------------------------------------------------------------|
| maxNumberOfTopEntities | number | The maximum number of top entities to display prominently. Default is 4.    |

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                                   |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback     |                                             | void        | Lifecycle method that runs when the element is added to the document's DOM.                   |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties or attributes change.                |
| disconnectedCallback  |                                             | void        | Lifecycle method that runs when the element is removed from the document's DOM.               |
| render                |                                             | TemplateResult | Renders the web research content including problem statements, search queries, and results.   |
| renderEntities        | subProblem: IEngineSubProblem               | TemplateResult | Renders entities related to a given sub-problem.                                              |
| renderSubProblemsWithAll |                                             | TemplateResult | Renders all sub-problems along with their related entities, search queries, and results.      |

## Events

No custom events are defined in this class.

## Example

```typescript
import '@policysynth/webapp/policies/ps-web-research.js';

// Usage in a LitElement template
html`
  <ps-web-research .memory="${this.memory}"></ps-web-research>
`;
```

This example demonstrates how to use the `ps-web-research` custom element within a LitElement-based component. The `.memory` property is bound to the component's `memory` property, which should contain the necessary data for rendering the web research content, including problem statements, sub-problems, and entities.