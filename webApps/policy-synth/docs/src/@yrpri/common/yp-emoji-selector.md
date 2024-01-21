# YpEmojiSelector

The `YpEmojiSelector` class is a web component that extends `YpBaseElement` to provide an emoji picker functionality. It allows users to select emojis and insert them into an input target.

## Properties

| Name        | Type                      | Description                                   |
|-------------|---------------------------|-----------------------------------------------|
| inputTarget | HTMLInputElement \| undefined | The input element where the emoji will be inserted. |

## Methods

| Name         | Parameters | Return Type | Description                                      |
|--------------|------------|-------------|--------------------------------------------------|
| render       |            | TemplateResult | Generates a template result for rendering the emoji selector button. |
| togglePicker |            | void        | Toggles the visibility of the emoji picker dialog. |

## Events

- **None**: This class does not emit any custom events.

## Examples

```typescript
// Example usage of the YpEmojiSelector web component
import 'path-to-yp-emoji-selector/yp-emoji-selector.js';

// Add the YpEmojiSelector element to your HTML
<yp-emoji-selector></yp-emoji-selector>

// In your JavaScript or TypeScript, you can set the input target
const emojiSelector = document.querySelector('yp-emoji-selector');
emojiSelector.inputTarget = document.querySelector('input');
```

Note: The `YpEmojiSelectorData` type used in the `togglePicker` method is not defined in the provided code snippet. It is assumed to be a custom type related to the emoji dialog functionality.