# AcActivity

`AcActivity` is a custom web component that renders different types of activities such as posts, points, news stories, and status updates. It is a subclass of `YpBaseElementWithLogin` and utilizes various properties to determine the type of activity to render and its associated data.

## Properties

| Name         | Type                | Description                                                                 |
|--------------|---------------------|-----------------------------------------------------------------------------|
| activity     | AcActivityData      | The activity data object containing details about the activity.             |
| domainId     | number              | The ID of the domain associated with the activity.                          |
| communityId  | number              | The ID of the community associated with the activity.                       |
| groupId      | number              | The ID of the group associated with the activity.                           |
| postId       | number              | The ID of the post associated with the activity.                            |
| postGroupId  | number              | The ID of the post group associated with the activity.                      |
| userId       | number              | The ID of the user associated with the activity.                            |

## Methods

| Name             | Parameters | Return Type | Description                                                                                   |
|------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| renderActivity   |            | TemplateResult | Renders the appropriate activity component based on the activity type.                        |
| render           |            | TemplateResult | Renders the entire activity component, including the activity content and associated user.    |
| fromTime         | timeValue: string | string | Converts an ISO time string to a relative time representation.                                |
| fromLongTime     | timeValue: string | string | Converts an ISO time string to a full local date and time string.                             |
| hasActivityAccess|            | boolean | Determines if the current user has access to the activity based on various associated IDs.    |
| _deleteActivity  |            | void | Emits an event to delete the activity.                                                        |
| _isNotActivityType | activity: AcActivityData, type: string | boolean | Checks if the activity is not of the specified type.                                          |
| _isActivityType  | activity: AcActivityData, type: string | boolean | Checks if the activity is of the specified type.                                              |

## Events (if any)

- **ak-delete-activity**: Emitted when the delete activity button is clicked, containing the ID of the activity to be deleted.

## Examples

```typescript
// Example usage of the AcActivity component
<ac-activity
  .activity="${this.someActivityData}"
  .domainId="${this.someDomainId}"
  .communityId="${this.someCommunityId}"
  .groupId="${this.someGroupId}"
  .postId="${this.somePostId}"
  .postGroupId="${this.somePostGroupId}"
  .userId="${this.someUserId}">
</ac-activity>
```

Note: `AcActivityData` is a type that should be defined elsewhere in the codebase, containing the structure of the activity data object.