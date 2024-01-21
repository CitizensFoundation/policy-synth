# CpsWebResearch

The `CpsWebResearch` class is a custom element that extends the `CpsStageBase` class, designed to handle the web research stage in a problem-solving application. It provides functionality to display problem statements, search queries, search results, and sub-problems with their associated entities and effects.

## Properties

| Name                   | Type   | Description                                                                 |
|------------------------|--------|-----------------------------------------------------------------------------|
| maxNumberOfTopEntities | number | The maximum number of top entities to display prominently in the UI.        |

## Methods

| Name                 | Parameters                                  | Return Type | Description                                                                                   |
|----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback    |                                             | void        | Lifecycle method that runs when the element is added to the DOM.                              |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties have changed.                        |
| disconnectedCallback |                                             | void        | Lifecycle method that runs when the element is removed from the DOM.                          |
| render               |                                             | TemplateResult | Renders the web research UI components.                                                       |
| renderEntities       | subProblem: IEngineSubProblem               | TemplateResult | Renders the entities associated with a given sub-problem.                                     |
| renderSubProblemsWithAll |                                             | TemplateResult | Renders all sub-problems with their search queries, search results, and entities.             |

## Events

- No custom events are emitted by this class.

## Examples

```typescript
// Example usage of the CpsWebResearch web component
import 'path-to-component/cps-web-research.js';

// Assuming you have an instance of the component in your HTML:
<yps-web-research></yps-web-research>

// You can interact with the component's properties and methods like any other web component.
const webResearchComponent = document.querySelector('yps-web-research');
webResearchComponent.maxNumberOfTopEntities = 3;
```

Note: The `IEngineSubProblem` type and other related types are not defined in the provided code snippet, so their definitions are assumed to be available in the context where this class is used.