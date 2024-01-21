# YpCodeBase

The `YpCodeBase` class serves as a base class providing utility methods for global event handling, language management, and displaying toast messages.

## Properties

| Name       | Type                | Description                           |
|------------|---------------------|---------------------------------------|
| language   | string \| undefined | The current language of the application. |

## Methods

| Name               | Parameters                                  | Return Type | Description                                                                 |
|--------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor        |                                             | void        | Initializes the class and sets up the language based on global settings.    |
| _languageEvent     | event: CustomEvent                          | void        | Handles the language change event and updates the language property.        |
| fire               | eventName: string, data: object \| string \| boolean \| number \| null, target: LitElement \| Document | void        | Dispatches a custom event with the specified name and data to the target.   |
| fireGlobal         | eventName: string, data: object \| string \| boolean \| number \| null | void        | Dispatches a custom event with the specified name and data to the document. |
| addListener        | name: string, callback: Function, target: LitElement \| Document | void        | Adds an event listener to the specified target.                             |
| addGlobalListener  | name: string, callback: Function            | void        | Adds a global event listener to the document.                               |
| showToast          | text: string, timeout: number               | void        | Displays a toast message with the specified text and timeout.               |
| removeListener     | name: string, callback: Function, target: LitElement \| Document | void        | Removes an event listener from the specified target.                        |
| removeGlobalListener | name: string, callback: Function          | void        | Removes a global event listener from the document.                          |
| t                  | ...args: Array<string>                      | string      | Retrieves a translation for the given key from the global i18nTranslation.  |

## Events

- **yp-language-loaded**: Triggered when the language is loaded or changed. It updates the language property and global locale.

## Examples

```typescript
// Example usage of YpCodeBase class
const codeBase = new YpCodeBase();

// Listening to a global language change event
codeBase.addGlobalListener('yp-language-loaded', (event: CustomEvent) => {
  console.log('Language changed to:', event.detail.language);
});

// Firing a global custom event
codeBase.fireGlobal('custom-event', { message: 'Hello World!' });

// Showing a toast message
codeBase.showToast('This is a toast message', 3000);

// Removing a global listener
codeBase.removeGlobalListener('yp-language-loaded', someFunction);
```