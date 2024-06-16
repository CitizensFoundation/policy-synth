# PsWebResearch

This class extends `PsStageBase` to implement the functionality for web research within a policy synthesis application. It is responsible for rendering the web research stage, including problem statements, search queries, search results, and entities related to sub-problems.

## Properties

| Name                  | Type   | Description                                                                 |
|-----------------------|--------|-----------------------------------------------------------------------------|
| maxNumberOfTopEntities| number | The maximum number of top entities to display. Default is 4.                |

## Methods

| Name                  | Parameters                                      | Return Type | Description                                                                                   |
|-----------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback     |                                                 | void        | Extends the base class method to initialize the web research stage.                          |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Extends the base class method to handle updates to the component's properties.               |
| disconnectedCallback  |                                                 | void        | Extends the base class method to perform cleanup when the component is removed from the DOM.  |
| render                |                                                 | TemplateResult | Renders the web research stage, including problem statements, search queries, and results.    |
| renderEntities        | subProblem: PsSubProblem                   | TemplateResult | Renders entities related to a given sub-problem.                                              |
| renderSubProblemsWithAll |                                                 | TemplateResult | Renders all sub-problems along with their related entities, search queries, and results.      |

## Events

None.

## Example

```typescript
import '@policysynth/webapp/policies/ps-web-research.js';

// Usage within a LitElement
class MyCustomElement extends LitElement {
  render() {
    return html`
      <ps-web-research></ps-web-research>
    `;
  }
}
customElements.define('my-custom-element', MyCustomElement);
```

This example demonstrates how to use the `ps-web-research` custom element within another LitElement-based component. It involves importing the `ps-web-research` component and then including it in the render method of your custom element.