# CpsHome

CpsHome is a custom element that extends the functionality of CpsStageBase. It is responsible for rendering the home page of the Policy Synth platform, showcasing various projects and providing information about the platform's purpose and how users can contribute.

## Properties

| Name   | Type   | Description                                                                 |
|--------|--------|-----------------------------------------------------------------------------|
| wide   | boolean | Inherited from CpsStageBase, indicates if the layout should be wide or not. |

## Methods

| Name                | Parameters                                  | Return Type | Description                                                                 |
|---------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   | none                                        | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties have changed.      |
| disconnectedCallback| none                                        | void        | Lifecycle method that runs when the element is removed from the document's DOM. |
| renderProject       | project: PsProjectData                      | TemplateResult | Renders a single project item.                                              |
| render              | none                                        | TemplateResult | Renders the home page content.                                              |

## Events

- No custom events are emitted by this component.

## Examples

```typescript
// Example usage of the CpsHome custom element
import 'path-to-cps-home/cps-home.js';

// Assuming the custom element 'cps-home' is registered and the necessary data is available
<html>
  <body>
    <cps-home></cps-home>
  </body>
</html>
```

**Note:** The `PsProjectData` type used in the `renderProject` method is not defined within the provided code snippet. It is assumed to be an external type that should be documented separately if it is part of the public API.