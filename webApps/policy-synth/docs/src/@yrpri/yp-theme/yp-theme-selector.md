# YpThemeSelector

The `YpThemeSelector` class is a web component that allows users to select a theme from a dropdown list. It extends from `YpBaseElement` and uses LitElement's `html` and `css` for rendering and styling.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| selectedTheme | Number | The currently selected theme's index, which may be undefined if no theme is selected. |
| themeObject   | Object | An object representing the theme container, which may be undefined. |
| themes        | Array  | An array of theme objects, each containing theme details such as name and whether it is disabled. |

## Methods

| Name                | Parameters                  | Return Type | Description                 |
|---------------------|-----------------------------|-------------|-----------------------------|
| updated             | changedProperties: Map      | void        | Called when the properties of the component have changed. It handles theme changes and updates the component accordingly. |
| connectedCallback   | None                        | void        | Lifecycle method called when the component is added to the DOM. It initializes the `themes` property with global theme data. |
| _selectTheme        | event: CustomEvent          | void        | Handles the selection of a theme from the dropdown list. |
| render              | None                        | TemplateResult | Returns a template result to render the component, including the theme selection dropdown. |
| _objectChanged      | None                        | void        | Called when the `themeObject` property changes. It updates the selected theme based on the new object. |
| _selectedThemeChanged | None                        | void        | Called when the `selectedTheme` property changes. It updates the global theme to the newly selected theme. |

## Events

- **yp-theme-changed**: Emitted when the selected theme changes.

## Examples

```typescript
// Example usage of the YpThemeSelector web component
<yp-theme-selector></yp-theme-selector>
```

Please note that the actual implementation of the `YpThemeContainerObject` and `window.appGlobals` is not provided in the snippet above, and these should be defined elsewhere in your application for the `YpThemeSelector` component to function correctly.