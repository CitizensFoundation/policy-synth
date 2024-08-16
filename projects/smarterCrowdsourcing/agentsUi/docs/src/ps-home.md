# PsHome

`PsHome` is a custom element that extends `PsStageBase` to display a home page for the Policy Synth web application. It showcases various projects related to policy synthesis, integrating both human insights and artificial intelligence to address complex policy issues. The class is responsible for rendering the home page layout, including project listings and additional information about the project's goals and invitation for collaboration.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| wide       | boolean | Indicates if the layout should be rendered in a wide format. This affects the sizing of images and layout responsiveness. |

## Methods

| Name                 | Parameters                                  | Return Type | Description                 |
|----------------------|---------------------------------------------|-------------|-----------------------------|
| connectedCallback    | None                                        | void        | Invoked when the element is added to the document's DOM. It performs initial setup such as setting up event listeners and fetching data. |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void        | Invoked after the element’s properties have been updated. Useful for reacting to changes. |
| disconnectedCallback | None                                        | void        | Invoked when the element is removed from the document's DOM. It performs cleanup tasks. |
| renderProject        | project: PsProjectData                     | TemplateResult | Renders a single project item. |
| render               | None                                        | TemplateResult | Renders the entire home page content, including project listings and additional information sections. |

## Events

No custom events are emitted by this class.

## Example

```typescript
import '@policysynth/webapp/ps-home.js';

// Usage in a LitElement
render() {
  return html`
    <ps-home></ps-home>
  `;
}
```

## Additional Types

### PsProjectData

This type represents the data structure for a project displayed on the home page.

| Name        | Type   | Description               |
|-------------|--------|---------------------------|
| id          | number | The unique identifier for the project. |
| title       | string | The title of the project. |
| imageUrl    | string | The URL to the project's image. |
| description | string | A brief description of the project. |

### Example PsProjectData

```typescript
const projectExample: PsProjectData = {
  id: 1,
  title: 'Democracy in Distress',
  imageUrl: 'https://cps-images.citizens.is/projects/1/problemStatement/images/916898992.png',
  description: 'The first test run is entirely automated except for the problem statement provided by us. All sub problems, entities and solutions with pros & cons are generated using GPT-4 & GPT-3.5. The context for solutions is obtained through curated web searches. This setup allows us to explore how human and AI-driven insights can work together to solve complex problems.'
};
```