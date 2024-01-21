# YpCodeBase

This class provides a base for handling global events, firing custom events, managing language settings, and interacting with the global objects defined in the window.

## Properties

| Name       | Type                | Description                           |
|------------|---------------------|---------------------------------------|
| language   | string \| undefined | The current language of the application. |

## Methods

| Name                | Parameters                                  | Return Type | Description                                                                 |
|---------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor         |                                             | void        | Initializes the class and sets up the language based on global settings.     |
| _languageEvent      | event: CustomEvent                          | void        | Handles the 'yp-language-loaded' event and updates the language property.   |
| fire                | eventName: string, data: object \| string \| boolean \| number \| null, target: LitElement \| Document | void        | Fires a custom event on the specified target.                               |
| fireGlobal          | eventName: string, data: object \| string \| boolean \| number \| null | void        | Fires a custom event on the global document object.                         |
| addListener         | name: string, callback: Function, target: LitElement \| Document | void        | Adds an event listener to the specified target.                             |
| addGlobalListener   | name: string, callback: Function            | void        | Adds a global event listener to the document object.                        |
| showToast           | text: string, timeout: number               | void        | Displays a toast message with the specified text and timeout.               |
| removeListener      | name: string, callback: Function, target: LitElement \| Document | void        | Removes an event listener from the specified target.                        |
| removeGlobalListener| name: string, callback: Function            | void        | Removes a global event listener from the document object.                   |
| t                   | ...args: Array<string>                      | string      | Retrieves a translation for the given key from the global i18nTranslation.  |

## Events

- **yp-language-loaded**: Triggered when the language is loaded or changed. It updates the language property and the global locale.

## Examples

```typescript
// Example usage of YpCodeBase to listen for a language change event
const ypCodeBaseInstance = new YpCodeBase();
ypCodeBaseInstance.addGlobalListener('yp-language-loaded', (event: CustomEvent) => {
  console.log('Language changed to:', event.detail.language);
});

// Example usage of YpCodeBase to fire a global custom event
ypCodeBaseInstance.fireGlobal('custom-event-name', { key: 'value' });

// Example usage of YpCodeBase to show a toast message
ypCodeBaseInstance.showToast('This is a toast message', 3000);

// Example usage of YpCodeBase to get a translation
const translation = ypCodeBaseInstance.t('translation.key');
console.log(translation);
```