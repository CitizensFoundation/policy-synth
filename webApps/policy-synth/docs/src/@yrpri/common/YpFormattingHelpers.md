# YpFormattingHelpers

YpFormattingHelpers is a utility class that provides static methods for common formatting tasks such as number formatting, class manipulation on HTML elements, string truncation, and string trimming.

## Properties

This class does not have any properties.

## Methods

| Name          | Parameters                                      | Return Type | Description                                                                                   |
|---------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| number        | value: number \| undefined                      | string      | Formats a number with a fixed number of decimal places and adds thousands separators.         |
| removeClass   | element: HTMLElement \| undefined \| null, classToRemove: string | void        | Removes a specified class from an HTML element's class list.                                  |
| truncate      | input: string, length: number, killwords: string \| undefined = undefined, end: string \| undefined = undefined | string      | Truncates a string to a specified length, optionally at a word boundary and with a custom end. |
| trim          | input: string                                   | string      | Trims whitespace from both ends of a string.                                                  |

## Events

This class does not emit any events.

## Examples

```typescript
// Example usage of formatting a number
const formattedNumber = YpFormattingHelpers.number(1234567);
console.log(formattedNumber); // Output: "1.234.567"

// Example usage of removing a class from an element
const element = document.getElementById('myElement');
YpFormattingHelpers.removeClass(element, 'myClassToRemove');

// Example usage of truncating a string
const truncatedString = YpFormattingHelpers.truncate('This is a long string that needs to be shortened.', 10);
console.log(truncatedString); // Output: "This is a..."

// Example usage of trimming a string
const trimmedString = YpFormattingHelpers.trim('   extra whitespace   ');
console.log(trimmedString); // Output: "extra whitespace"
```