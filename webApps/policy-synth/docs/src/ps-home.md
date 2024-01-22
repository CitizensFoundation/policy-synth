# PsHome

PsHome is a custom element that extends the PsStageBase class, designed to render the home page of the Policy Synth platform. It displays a list of projects, a welcome title, and additional information about the platform's goals and invitation to collaborate on GitHub.

## Properties

| Name   | Type            | Description                                      |
|--------|-----------------|--------------------------------------------------|
| wide   | boolean         | Indicates if the layout should be wide or not.   |

## Methods

| Name                | Parameters                                  | Return Type | Description                                                                 |
|---------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   | none                                        | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties have changed.      |
| disconnectedCallback| none                                        | void        | Lifecycle method that runs when the element is removed from the document's DOM. |
| renderProject       | project: PsProjectData                      | TemplateResult | Renders a single project item.                                             |
| render              | none                                        | TemplateResult | Renders the home page content.                                             |

## Events

- **None specified**

## Examples

```typescript
// Example usage of the PsHome custom element
import { PsHome } from './path/to/ps-home.js';

// Assuming 'projects' is an array of PsProjectData objects and 'wide' is a boolean
const homeElement = new PsHome();
homeElement.wide = true; // Set to false for a narrower layout
document.body.appendChild(homeElement);

// To render a project item (assuming 'project' is a PsProjectData object)
homeElement.renderProject(project);
```

**Note:** The actual usage would typically involve including the `ps-home` element in an HTML file and the properties and methods would be used within the context of the LitElement lifecycle and data flow.