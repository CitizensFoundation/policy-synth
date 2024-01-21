# AcActivityPointNewsStory

This class represents a custom element that displays a news story activity with an optional group header. It extends `AcActivityWithGroupBase` and includes styles and rendering logic for the news story content.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| hidePostName  | boolean | Determines whether the post name should be hidden based on the presence of a `postId`. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| _goToPost  | -                 | void        | Navigates to the post associated with the activity. |

## Events

- **click**: Emitted when the post name is clicked, triggering the `_goToPost` method.

## Examples

```typescript
// Example usage of the AcActivityPointNewsStory web component
<ac-activity-point-news-story></ac-activity-point-news-story>
```

Note: The actual usage of this component would typically involve providing the `activity` and optionally `groupTitle` properties, which are inherited from `AcActivityWithGroupBase` and are not directly defined within `AcActivityPointNewsStory`.