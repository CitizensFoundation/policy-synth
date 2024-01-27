# PsProblemStatement

`PsProblemStatement` is a custom element that extends `PsStageBase`. It is responsible for rendering the problem statement section of the application. This component is part of the policy synthesis web application and is used to display the problem statement, search queries related to the problem statement, and the search results for solutions to the problem statement.

## Properties

No public properties are defined in this class beyond those inherited from its parent class, `PsStageBase`.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     | None                                        | void        | Called when the element is added to the document's DOM.                    |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Called after the element’s properties have been updated.                   |
| disconnectedCallback  | None                                        | void        | Called when the element is removed from the document's DOM.                 |
| render                | None                                        | TemplateResult | Responsible for rendering the element's HTML structure.                     |

## Events

No custom events are emitted by this class.

## Example

```typescript
import '@policysynth/webapp/policies/ps-problem-statement.js';

// Usage in HTML
<ps-problem-statement></ps-problem-statement>

// Assuming you have defined the necessary properties and methods in your application to support this element.
```

This example demonstrates how to import and use the `PsProblemStatement` custom element within a web application. It assumes that the necessary infrastructure and supporting methods (such as `renderProblemStatement`, `renderSearchQueries`, and `renderSearchResults`) are implemented elsewhere in your application, as these are referenced within the `render` method of `PsProblemStatement`.