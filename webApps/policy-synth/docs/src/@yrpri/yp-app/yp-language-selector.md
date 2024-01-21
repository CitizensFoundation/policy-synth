# YpLanguageSelector

The `YpLanguageSelector` class is a web component that provides a dropdown menu for users to select a language. It is built using the Lit library and extends the `YpBaseElement` class. The component can optionally handle user events, auto-translate content, and refresh the list of languages. It also emits custom events when the selected language changes.

## Properties

| Name                        | Type      | Description                                                                 |
|-----------------------------|-----------|-----------------------------------------------------------------------------|
| refreshLanguages            | Boolean   | If true, triggers a refresh of the language list.                           |
| noUserEvents                | Boolean   | If true, user events such as language change will not be handled.           |
| selectedLocale              | String    | The currently selected language locale.                                     |
| value                       | String    | The value of the selected language.                                         |
| name                        | String    | The name of the language selector.                                          |
| autoTranslateOptionDisabled | Boolean   | If true, disables the auto-translate option.                                |
| autoTranslate               | Boolean   | If true, content will be auto-translated to the selected language.          |
| dropdownVisible             | Boolean   | If true, the language dropdown is visible.                                  |
| hasServerAutoTranslation    | Boolean   | If true, the server supports auto-translation.                              |
| isOutsideChangeEvent        | Boolean   | If true, indicates that the change event was triggered from outside.        |

## Methods

| Name                   | Parameters                  | Return Type | Description                                                                 |
|------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| updated                | changedProperties: Map      | void        | Lifecycle method called when properties change, emits language change event.|
| _refreshLanguage       |                             | void        | Refreshes the language selection dropdown.                                  |
| render                 |                             | TemplateResult | Renders the language selector component.                                 |
| _selectLanguage        | event: CustomEvent          | void        | Handles language selection from the dropdown.                               |
| connectedCallback      |                             | Promise<void> | Lifecycle method called when the component is added to the DOM.          |
| disconnectedCallback   |                             | void        | Lifecycle method called when the component is removed from the DOM.         |
| _autoTranslateEvent    | event: CustomEvent          | void        | Handles auto-translate toggle events.                                      |
| _stopTranslation       |                             | void        | Stops the auto-translation process.                                        |
| startTranslation       |                             | void        | Starts the auto-translation process.                                       |
| canUseAutoTranslate    |                             | Boolean     | Getter that determines if auto-translate can be used.                       |
| languages              |                             | Array       | Getter that returns an array of supported languages.                        |
| _selectedLocaleChanged | oldLocale: String           | void        | Handles changes to the selected locale.                                    |

## Events

- **yp-selected-locale-changed**: Emitted when the selected locale changes.
- **yp-refresh-language-selection**: Emitted to refresh the language selection.
- **yp-auto-translate**: Emitted when auto-translate is toggled.
- **yp-language-name**: Emitted with the name of the current language.

## Examples

```typescript
// Example usage of the YpLanguageSelector web component
<yp-language-selector
  .selectedLocale="${this.selectedLocale}"
  @yp-selected-locale-changed="${this.handleLocaleChange}"
></yp-language-selector>
```

Note: The actual usage of the component may vary depending on the context within the application it is used.