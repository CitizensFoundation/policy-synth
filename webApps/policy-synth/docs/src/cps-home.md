# CpsHome

CpsHome is a custom element that extends the functionality of CpsStageBase. It is responsible for rendering the home page of the Policy Synth platform, showcasing various projects and providing information about the platform's purpose. It also includes links to further information and collaboration opportunities on GitHub.

## Properties

| Name   | Type   | Description               |
|--------|--------|---------------------------|
| wide   | boolean | Indicates if the layout should be wide. |

## Methods

| Name                | Parameters                                  | Return Type | Description                 |
|---------------------|---------------------------------------------|-------------|-----------------------------|
| connectedCallback   | -                                           | void        | Lifecycle method called when the element is added to the document's DOM. |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method called after the element’s DOM has been updated. |
| disconnectedCallback| -                                           | void        | Lifecycle method called when the element is removed from the document's DOM. |
| renderProject       | project: PsProjectData                      | TemplateResult | Renders a single project item. |
| render              | -                                           | TemplateResult | Renders the home page content. |

## Events

- **None specified**

## Examples

```typescript
// Example usage of the CpsHome custom element
import 'path-to-components/cps-home.js';

// Adding the element to the HTML
<html>
  <body>
    <cps-home></cps-home>
  </body>
</html>

// The element will render the home page with projects and additional information.
```

**Note:** The `PsProjectData` type used in the `renderProject` method is not defined in the provided code snippet. It is assumed to be an external type that should be documented separately if it is part of the public API.