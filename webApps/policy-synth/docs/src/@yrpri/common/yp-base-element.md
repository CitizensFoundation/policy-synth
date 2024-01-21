# YpBaseElement

`YpBaseElement` is a class that extends `LitElement` to provide additional properties and methods for internationalization, theming, and responsive design.

## Properties

| Name           | Type                      | Description                                      |
|----------------|---------------------------|--------------------------------------------------|
| language       | string                    | The current language. Defaults to 'en'.          |
| wide           | boolean                   | Indicates if the layout is wide.                 |
| rtl            | boolean                   | Indicates if the text direction is right-to-left.|
| largeFont      | boolean                   | Indicates if large font is enabled.              |
| themeColor     | string                    | The theme color in hex format. Defaults to '#FFE800'. |
| themeDarkMode  | boolean \| undefined      | Indicates if dark mode is enabled.               |

## Methods

| Name              | Parameters                        | Return Type | Description                                             |
|-------------------|-----------------------------------|-------------|---------------------------------------------------------|
| connectedCallback |                                   | void        | Lifecycle method called when the element is connected.  |
| disconnectedCallback |                               | void        | Lifecycle method called when the element is disconnected. |
| isAppleDevice     |                                   | boolean     | Getter that returns true if the device is an Apple device. |
| updated           | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element's properties have been updated. |
| languageChanged   |                                   | void        | Called when the language property changes. Override if needed. |
| fire              | eventName: string, data: object \| string \| boolean \| number \| null = {}, target: LitElement \| Document = this | void | Dispatches a custom event. |
| fireGlobal        | eventName: string, data: object \| string \| boolean \| number \| null = {} | void | Dispatches a custom event at the document level. |
| addListener       | name: string, callback: Function, target: LitElement \| Document = this | void | Adds an event listener. |
| addGlobalListener | name: string, callback: Function | void | Adds a global event listener to the document. |
| removeListener    | name: string, callback: Function, target: LitElement \| Document = this | void | Removes an event listener. |
| removeGlobalListener | name: string, callback: Function | void | Removes a global event listener from the document. |
| t                 | ...args: Array<string>           | string     | Translates a given key using the global i18nTranslation object. |
| $$                | id: string                       | HTMLElement \| null | Selects and returns an element from the shadow DOM. |

## Events

- **yp-language-loaded**: Emitted when the language is loaded.
- **yp-large-font**: Emitted when the large font setting is toggled.
- **yp-theme-color**: Emitted when the theme color is changed.
- **yp-theme-dark-mode**: Emitted when the dark mode setting is toggled.

## Examples

```typescript
// Example usage of YpBaseElement
class MyCustomElement extends YpBaseElement {
  connectedCallback() {
    super.connectedCallback();
    // Custom logic for when the element is connected
  }

  languageChanged() {
    // Custom logic for when the language changes
  }
}
```