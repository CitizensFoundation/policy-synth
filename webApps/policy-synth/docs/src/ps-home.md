# PsHome

`PsHome` is a custom element that extends `PsStageBase` to display the home page of the Policy Synth web application. It showcases a selection of projects and provides information about the initiative to combine collective and artificial intelligence for solving complex policy issues.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| wide       | boolean | Indicates if the layout should be rendered in a wide format. This property is inherited from `PsStageBase`. |

## Methods

| Name                 | Parameters                           | Return Type | Description                                                                 |
|----------------------|--------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback    |                                      | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties change.            |
| disconnectedCallback |                                      | void        | Lifecycle method that runs when the element is removed from the document's DOM. |
| renderProject        | project: PsProjectData               | TemplateResult | Renders a single project item.                                              |
| render               |                                      | TemplateResult | Renders the home page content.                                               |

## Events

No custom events are defined in `PsHome`.

## Example

```typescript
import '@policysynth/webapp/ps-home.js';

// Usage in HTML
<ps-home></ps-home>

// Note: The `ps-home` element utilizes LitElement's rendering capabilities to dynamically display content based on the projects data and the application's state. It inherits properties and methods from `PsStageBase`, which is not detailed here.
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

Projects are defined in an array at the beginning of the `ps-home.js` file and are used to render the list of projects on the home page.