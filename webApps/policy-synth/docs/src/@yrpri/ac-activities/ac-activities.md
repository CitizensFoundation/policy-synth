# AcActivities

The `AcActivities` class is a custom element that displays a list of activities, such as posts or news stories, within a domain, community, group, post, or user collection. It supports infinite scrolling, loading more data as the user scrolls down. It also provides a way for logged-in users to add new posts and recommends posts based on the collection type.

## Properties

| Name                        | Type                                  | Description                                                                                   |
|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------------------------|
| disableNewPosts             | Boolean                               | If true, disables the ability to post new activities.                                         |
| noRecommendedPosts          | Boolean                               | If true, no recommended posts are shown.                                                      |
| gotInitialData              | Boolean                               | If true, indicates that the initial data has been loaded.                                     |
| activities                  | Array<AcActivityData> \| undefined    | An array of activity data objects.                                                            |
| domainId                    | number \| undefined                   | The ID of the domain to which the activities belong.                                          |
| collectionId                | number                                | The ID of the collection (domain, community, group, post, or user) to which the activities belong. |
| collectionType              | string                                | The type of collection (e.g., 'domain', 'community', 'group', 'post', 'user').               |
| communityId                 | number \| undefined                   | The ID of the community to which the activities belong.                                       |
| groupId                     | number \| undefined                   | The ID of the group to which the activities belong.                                           |
| postId                      | number \| undefined                   | The ID of the post to which the activities belong.                                            |
| postGroupId                 | number \| undefined                   | The ID of the post group to which the activities belong.                                      |
| userId                      | number \| undefined                   | The ID of the user to which the activities belong.                                            |
| mode                        | 'activities' \| 'news_feeds'          | The mode of the component, which determines the type of data to display.                     |
| url                         | string \| undefined                   | The URL used to fetch activities data.                                                        |
| latestProcessedActivityAt   | string \| undefined                   | The timestamp of the latest processed activity.                                               |
| oldestProcessedActivityAt   | string \| undefined                   | The timestamp of the oldest processed activity.                                               |
| activityIdToDelete          | number \| undefined                   | The ID of the activity to be deleted.                                                         |
| recommendedPosts            | Array<YpPostData> \| undefined        | An array of recommended post data objects.                                                    |
| closeNewsfeedSubmissions    | Boolean                               | If true, closes the ability to submit new posts to the newsfeed.                              |

## Methods

| Name            | Parameters                  | Return Type | Description                                                                 |
|-----------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| updated         | changedProperties: Map      | void        | Lifecycle method that is called after the element’s properties have changed.|
| renderItem      | activity: AcActivityData, index: number | TemplateResult | Renders an individual activity item.                                        |
| render          |                             | TemplateResult | Renders the component's HTML template.                                      |
| scrollEvent     | event: any                  | void        | Handles the scroll event for loading more data.                             |
| connectedCallback |                           | void        | Lifecycle method that is called when the element is added to the document.  |
| disconnectedCallback |                       | void        | Lifecycle method that is called when the element is removed from the document. |
| _openLogin      |                             | void        | Opens the login dialog.                                                     |
| _pointDeleted   | event: CustomEvent          | void        | Handles the deletion of a point (activity).                                 |
| _activityDeletedResponse | event: CustomEvent | void        | Handles the response after an activity is deleted.                          |
| _removeActivityId | activityId: number        | void        | Removes an activity from the list by its ID.                               |
| _deleteActivity | event: CustomEvent          | void        | Initiates the deletion of an activity.                                      |
| _reallyDelete   |                             | Promise<void> | Confirms and carries out the deletion of an activity.                      |
| _generateRequest | typeId: number, typeName: string | void | Generates a request to fetch activities based on type and ID.              |
| _loadMoreData   |                             | Promise<void> | Loads more activity data.                                                  |
| loadNewData     |                             | Promise<void> | Loads new activity data.                                                   |
| _domainIdChanged |                           | void        | Handles changes to the domain ID.                                          |
| _communityIdChanged |                       | void        | Handles changes to the community ID.                                       |
| _groupIdChanged |                             | void        | Handles changes to the group ID.                                           |
| _postIdChanged  |                             | void        | Handles changes to the post ID.                                            |
| _userIdChanged  |                             | void        | Handles changes to the user ID.                                            |
| _clearScrollThreshold |                      | void        | Clears the scroll threshold.                                               |
| _getRecommendations | typeName: string, typeId: number | Promise<void> | Fetches recommended posts.                                                |
| _preProcessActivities | activities: Array<AcActivityData> | Array<AcActivityData> | Pre-processes activities before rendering.       |
| _processResponse | activitiesResponse: AcActivitiesResponse | void | Processes the response from the server after fetching activities.          |
| scrollToItem    | item: AcActivityData        | void        | Scrolls to a specific activity item.                                       |
| fireResize      |                             | void        | Fires a resize event for the component.                                    |

## Events (if any)

- **ak-delete-activity**: Emitted when an activity is requested to be deleted.
- **yp-point-deleted**: Emitted when a point (activity) is deleted.
- **yp-refresh-activities-scroll-threshold**: Emitted to refresh the scroll threshold.
- **yp-open-login**: Emitted to open the login dialog.

## Examples

```typescript
// Example usage of the AcActivities component
<ac-activities
  .domainId=${123}
  .communityId=${456}
  .groupId=${789}
  .postId=${101}
  .userId=${102}
  .collectionType=${'community'}
  .activities=${[/* array of AcActivityData */]}
  .recommendedPosts=${[/* array of YpPostData */]}
></ac-activities>
```

Please note that the above example is a hypothetical usage within an HTML template and assumes that the necessary data is provided to the component's properties.