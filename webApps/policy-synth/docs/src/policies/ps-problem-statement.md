# PsProblemStatement

`PsProblemStatement` is a custom element that extends `PsStageBase`. It is responsible for rendering the problem statement section of a web application. This component is part of the policy synthesis web application and is designed to display the problem statement, search queries related to the problem statement, and the search results for solutions to the problem statement.

## Properties

No properties are explicitly defined in this class. However, it inherits properties from `PsStageBase`.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     | None                                        | void        | Called when the element is added to the document's DOM.                     |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Called after the element’s properties have been updated.                    |
| disconnectedCallback  | None                                        | void        | Called when the element is removed from the document's DOM.                 |
| styles                | None                                        | CSSResult[] | Static getter for the component's styles.                                   |
| render                | None                                        | TemplateResult | Responsible for rendering the element's HTML structure. |

## Events

No custom events are defined in this class.

## Example

```typescript
import '@policysynth/webapp/policies/ps-problem-statement.js';

// Usage in a LitElement
class ExampleElement extends LitElement {
  render() {
    return html`
      <ps-problem-statement></ps-problem-statement>
    `;
  }
}
customElements.define('example-element', ExampleElement);
```

This example demonstrates how to use the `ps-problem-statement` custom element within another LitElement-based component. It shows the basic setup required to incorporate the problem statement section into a web application.