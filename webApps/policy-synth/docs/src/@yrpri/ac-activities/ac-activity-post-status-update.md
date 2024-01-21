# AcActivityPostStatusUpdate

The `AcActivityPostStatusUpdate` class is a web component that extends `YpBaseElement` to display a status update for an activity post. It includes the group name, post name, and the status change content.

## Properties

| Name      | Type            | Description                                   |
|-----------|-----------------|-----------------------------------------------|
| activity  | AcActivityData  | The activity data containing the status update. |

## Methods

| Name       | Parameters | Return Type | Description                                 |
|------------|------------|-------------|---------------------------------------------|
| _goToPost  |            | void        | Navigates to the post associated with the activity. |

## Events

- **click**: Emitted when the post name is clicked, triggering navigation to the post.

## Examples

```typescript
// Example usage of AcActivityPostStatusUpdate
<ac-activity-post-status-update .activity=${activityData}></ac-activity-post-status-update>
```

**Note:** The `activity` property must be set with an instance of `AcActivityData` containing the necessary details for the status update. The `AcActivityData` type should define the structure of the activity data, including any nested types such as `Group`, `Post`, and `PostStatusChange`.