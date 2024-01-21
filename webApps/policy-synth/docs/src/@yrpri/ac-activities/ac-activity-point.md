# AcActivityPoint

`AcActivityPoint` is a custom web component that extends `YpBaseElementWithLogin` to display a point related to an activity within a post. It includes styles for layout and interactivity, and uses other custom elements like `yp-magic-text` and `yp-point` to render the activity's details. The component also provides methods to navigate to the related post when certain elements are clicked.

## Properties

| Name      | Type            | Description                                       |
|-----------|-----------------|---------------------------------------------------|
| activity  | AcActivityData  | The activity data associated with the point.      |
| postId    | number\|undefined | The ID of the post, if applicable.              |

## Methods

| Name         | Parameters | Return Type | Description                                           |
|--------------|------------|-------------|-------------------------------------------------------|
| _goToPoint   |            | void        | Navigates to the post related to the activity point.  |
| isUpVote     |            | boolean     | Returns true if the point value is greater than zero. |
| isDownVote   |            | boolean     | Returns true if the point value is less than zero.    |

## Events

- **click**: Emitted when the `.actionInfo` or `.post-name` elements are clicked, triggering the `_goToPoint` method.

## Examples

```typescript
// Example usage of AcActivityPoint
<ac-activity-point .activity="${someActivityData}" .postId="${somePostId}"></ac-activity-point>
```

Note: `AcActivityData` is assumed to be a custom type related to the activity data structure, which should be defined elsewhere in the codebase.