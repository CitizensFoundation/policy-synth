# AcActivityWithGroupBase

Brief description of the class.

## Properties

| Name        | Type             | Description               |
|-------------|------------------|---------------------------|
| postId      | number \| undefined | The ID of the post.        |
| groupId     | number \| undefined | The ID of the group.       |
| communityId | number \| undefined | The ID of the community.   |
| activity    | AcActivityData   | The activity data object. |

## Methods

| Name            | Parameters | Return Type | Description                 |
|-----------------|------------|-------------|-----------------------------|
| hasGroupHeader  |            | boolean     | Returns true if the activity has a group header that is not the hidden public group for domain level points, and there is no postId or groupId. |
| groupTitle      |            | string      | Returns the title of the group, which may include the community name if it's different from the group name and there is no groupId. Returns an empty string if conditions are not met. |

## Events

(none)

## Examples

```typescript
// Example usage of AcActivityWithGroupBase
const activityComponent = document.createElement('ac-activity-with-group-base');
activityComponent.activity = {
  // ... AcActivityData properties
};
activityComponent.postId = 123;
activityComponent.groupId = 456;
// Append to a container
document.body.appendChild(activityComponent);
```

Note: The `AcActivityData` type is assumed to be defined elsewhere in the codebase and should be documented separately for complete API documentation.