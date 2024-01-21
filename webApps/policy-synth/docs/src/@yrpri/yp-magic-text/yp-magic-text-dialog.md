# YpMagicTextDialog

`YpMagicTextDialog` is a custom web component that extends `YpMagicText` to display text content within a dialog. It uses Material Web Components for the dialog and buttons.

## Properties

| Name                     | Type      | Description                                           |
|--------------------------|-----------|-------------------------------------------------------|
| content                  | string    | The text content to be displayed in the dialog.       |
| contentId                | number    | An identifier for the content.                        |
| extraId                  | number    | An additional identifier used in the dialog.          |
| textType                 | string    | The type of text content.                             |
| contentLanguage          | string    | The language of the text content.                     |
| closeDialogText          | string    | The text for the close button of the dialog.          |
| structuredQuestionsConfig| string    | Configuration for structured questions.               |
| skipSanitize             | boolean   | Whether to skip sanitization of the content.          |
| disableTranslation       | boolean   | Whether to disable translation of the content.        |
| isDialog                 | boolean   | Indicates if the current component is in dialog mode. |
| processedContent         | string    | The processed content with certain transformations.   |

## Methods

| Name            | Parameters                                                                                                      | Return Type | Description                                                                                   |
|-----------------|-----------------------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| open            | content: string, contentId: number, extraId: number, textType: string, contentLanguage: string, closeDialogText: string, structuredQuestionsConfig: string, skipSanitize: boolean, disableTranslation: boolean | void        | Opens the dialog with the provided content and configuration.                                 |
| subClassProcessing | none                                                                                                            | void        | Processes the content specific to this subclass, replacing line breaks with HTML `<br />` tags.|

## Events

- **iron-resize**: Emitted after the dialog is opened and a resize is required.

## Examples

```typescript
// Example usage of the YpMagicTextDialog component
const dialog = document.createElement('yp-magic-text-dialog');
dialog.open(
  'Sample content for the dialog.',
  123,
  456,
  'info',
  'en',
  'Close',
  '{}',
  false,
  false
);
document.body.appendChild(dialog);
```

Please note that the actual implementation of the `fire` method and the `iron-resize` event should be provided within the context of the application in which this component is used.