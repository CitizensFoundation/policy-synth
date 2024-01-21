# YpPostTags

The `YpPostTags` class is a custom element that displays tags associated with a post. It supports auto-translation of tags and can hide or show the middle dot separator based on the position of the tag in the list.

## Properties

| Name            | Type                  | Description                                           |
|-----------------|-----------------------|-------------------------------------------------------|
| post            | YpPostData            | The post data object containing tags and other info.  |
| translatedTags  | string \| undefined   | The translated tags as a string, if available.        |
| autoTranslate   | boolean               | Flag to indicate if tags should be auto-translated.   |

## Methods

| Name               | Parameters                  | Return Type | Description                                             |
|--------------------|-----------------------------|-------------|---------------------------------------------------------|
| _trimmedItem       | item: string                | string      | Trims the provided tag item and returns it.             |
| _autoTranslateEvent| event: CustomEvent          | void        | Updates the `autoTranslate` property based on an event. |
| computeSpanHidden  | items: Array<string>, index: number | boolean | Determines if the middle dot should be hidden based on the tag's index. |
| _newTranslation    |                             | void        | Handles the new translation event for tags.             |
| postTags           |                             | Array<string> | Computes and returns the list of tags to be displayed. |

## Events

- **new-translation**: Description of when and why the event is emitted.

## Examples

```typescript
// Example usage of the YpPostTags custom element
<yp-post-tags .post="${postObject}" .autoTranslate="${true}"></yp-post-tags>
```

Please note that the `YpPostData` type is assumed to be defined elsewhere in your codebase, and should be documented accordingly. The `YpMagicText` class is also assumed to be a custom element defined elsewhere and should have its own documentation.