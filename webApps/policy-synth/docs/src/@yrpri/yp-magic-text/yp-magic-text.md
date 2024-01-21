# YpMagicText

`YpMagicText` is a custom web component that extends `YpBaseElement` to display text content with various features such as auto-translation, truncation, linkification, and emoji support. It can handle different text types and languages, and it provides a full-screen dialog option for viewing the entire content.

## Properties

| Name                        | Type      | Description                                                                 |
|-----------------------------|-----------|-----------------------------------------------------------------------------|
| content                     | `string` \| `undefined` | The text content to be displayed.                                           |
| truncatedContent            | `string` \| `undefined` | The truncated version of the content if it exceeds the specified length.    |
| contentId                   | `number` \| `undefined` | The identifier for the content, used for translation purposes.              |
| extraId                     | `number` \| `undefined` | An additional identifier used in conjunction with contentId.                |
| textType                    | `string` \| `undefined` | The type of text content, used for translation purposes.                    |
| contentLanguage             | `string` \| `undefined` | The language of the content.                                                |
| processedContent            | `string` \| `undefined` | The content after processing, such as translation or formatting.            |
| finalContent                | `string` \| `undefined` | The final content to be displayed after all processing is complete.         |
| autoTranslate               | `boolean` | Whether the content should be auto-translated. Defaults to `false`.         |
| truncate                    | `number` \| `undefined` | The maximum length of content before truncation.                            |
| moreText                    | `string` \| `undefined` | The text for the "more" button when content is truncated.                   |
| closeDialogText             | `string` \| `undefined` | The text for the close button in the full-screen dialog.                    |
| textOnly                    | `boolean` | Whether to display only text without any formatting. Defaults to `false`.   |
| isDialog                    | `boolean` | Whether the component is being used within a dialog. Defaults to `false`.   |
| disableTranslation          | `boolean` | Whether to disable the translation feature. Defaults to `false`.            |
| simpleFormat                | `boolean` | Whether to use simple formatting for the content. Defaults to `false`.      |
| skipSanitize                | `boolean` | Whether to skip sanitization of the content. Defaults to `false`.           |
| removeUrls                  | `boolean` | Whether to remove URLs from the content. Defaults to `false`.               |
| structuredQuestionsConfig   | `string` \| `undefined` | Configuration for structured questions within the content.                  |
| linkifyCutoff               | `number`  | The maximum length of displayed URLs after which they are truncated.        |
| widetext                    | `boolean` | Whether the text should be displayed in a wider format. Reflects to attribute. |

## Methods

| Name                  | Parameters | Return Type | Description                                                                 |
|-----------------------|------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     | -          | `void`      | Lifecycle method called when the component is added to the DOM.             |
| disconnectedCallback  | -          | `void`      | Lifecycle method called when the component is removed from the DOM.         |
| render                | -          | `TemplateResult` | Renders the HTML template for the component.                                |
| _openFullScreen       | -          | `void`      | Opens the full-screen dialog to display the entire content.                  |
| subClassProcessing    | -          | `void`      | Placeholder for additional processing in subclasses.                        |
| updated               | `changedProperties: Map<string \| number \| symbol, unknown>` | `void` | Lifecycle method called after the component's properties have changed.      |
| _autoTranslateEvent   | `event: CustomEvent` | `void` | Handles the auto-translate event.                                           |
| _languageEvent        | `event: CustomEvent` | `void` | Handles the language change event.                                          |
| _startTranslationAndFinalize | -  | `Promise<void>` | Starts the translation process and finalizes content preparation.           |
| _update               | -          | `void`      | Updates the component's content based on current properties.                |
| _setupStructuredQuestions | -    | `void`      | Sets up structured questions within the content if configured.              |
| _finalize             | -          | `void`      | Finalizes the content processing and updates the display.                   |
| _linksAndEmojis       | -          | `void`      | Processes links and emojis within the content.                              |

## Events (if any)

- **yp-auto-translate**: Emitted when the auto-translate feature is toggled.
- **new-translation**: Emitted when a new translation is available.

## Examples

```typescript
// Example usage of the YpMagicText component
<yp-magic-text
  content="This is a sample text."
  contentId={123}
  textType="postContent"
  contentLanguage="en"
  autoTranslate={true}
  truncate={100}
  moreText="Read more"
></yp-magic-text>
```

Note: The above example assumes that the `YpMagicText` component is registered and available in the DOM.