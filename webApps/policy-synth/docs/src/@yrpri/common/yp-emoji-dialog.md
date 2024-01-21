# YpEmojiDialog

This class represents a custom emoji dialog element that allows users to pick emojis and insert them into an input field. It extends `YpBaseElement` and uses the `picmo` library to create an emoji picker popup.

## Properties

| Name        | Type                        | Description                                      |
|-------------|-----------------------------|--------------------------------------------------|
| inputTarget | HTMLInputElement \| undefined | The input element where the selected emoji will be inserted. |

## Methods

| Name            | Parameters                  | Return Type | Description                                                                 |
|-----------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback | none                        | void        | Lifecycle method that runs when the element is added to the DOM.            |
| disconnectedCallback | none                        | void        | Lifecycle method that runs when the element is removed from the DOM.         |
| createPicker    | none                        | void        | Initializes and opens the emoji picker popup.                               |
| removePicker    | none                        | void        | Removes the event listener, destroys the picker, and cleans up references.  |
| pickEmoji       | selection: EmojiSelection   | void        | Handles the selection of an emoji and inserts it into the `inputTarget`.    |
| open            | trigger: HTMLElement, inputTarget: HTMLInputElement | void        | Opens the emoji picker relative to the provided trigger element and sets the input target. |
| get i18nStrings | none                        | object      | Returns an object containing internationalization strings for the picker.   |

## Events (if any)

- **emoji:select**: Emitted when an emoji is selected from the picker.

## Examples

```typescript
// Example usage of the emoji dialog
const emojiDialog = document.createElement('yp-emoji-dialog') as YpEmojiDialog;
const inputField = document.querySelector('input') as HTMLInputElement;
const triggerButton = document.querySelector('button') as HTMLElement;

// Open the emoji dialog when the trigger button is clicked
triggerButton.addEventListener('click', () => {
  emojiDialog.open(triggerButton, inputField);
});

// Append the emoji dialog to the body
document.body.appendChild(emojiDialog);
```

Note: The `pickEmoji` method contains a TODO comment to replace the current insertion logic with a more sophisticated one, such as using the `insert-text-at-cursor` library. Additionally, the `i18nStrings` method contains a TODO comment to finish localizing the emoji picker strings.