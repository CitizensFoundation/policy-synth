# CpsWebResearch

CpsWebResearch is a custom element that extends the functionality of CpsStageBase to provide a web research interface. It allows users to view and interact with problem statements, search queries, search results, and entities related to sub-problems.

## Properties

| Name                   | Type   | Description                                                  |
|------------------------|--------|--------------------------------------------------------------|
| maxNumberOfTopEntities | number | The maximum number of top entities to display prominently.   |

## Methods

| Name                | Parameters                                  | Return Type | Description                                                                 |
|---------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   | -                                           | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties have changed.      |
| disconnectedCallback| -                                           | void        | Lifecycle method that runs when the element is removed from the document's DOM. |
| render              | -                                           | TemplateResult | Renders the web research content.                                         |
| renderEntities      | subProblem: IEngineSubProblem               | TemplateResult | Renders the entities associated with a given sub-problem.                  |
| renderSubProblemsWithAll | -                                       | TemplateResult | Renders all sub-problems with their associated entities and details.      |

## Events

- **None specified**

## Examples

```typescript
// Example usage of the CpsWebResearch custom element
import 'path-to-cps-web-research/cps-web-research.js';

// Adding the element to HTML
<html>
  <body>
    <cps-web-research></cps-web-research>
  </body>
</html>

// Interacting with the element in TypeScript
const cpsWebResearchElement = document.querySelector('cps-web-research');
if (cpsWebResearchElement) {
  cpsWebResearchElement.maxNumberOfTopEntities = 5;
}
```

Note: The actual usage of the element would depend on the context in which it is used, including the surrounding application logic and state management.