# YpPost

The `YpPost` class extends the `YpCollection` class and represents a post within a collection. It includes properties and methods for managing the post's data, rendering the post header, tabs, and page content, as well as handling various events and updates related to the post.

## Properties

| Name              | Type                      | Description                                                                 |
|-------------------|---------------------------|-----------------------------------------------------------------------------|
| isAdmin           | Boolean                   | Indicates if the current user is an admin.                                  |
| disableNewPosts   | Boolean                   | Determines whether new posts are disabled.                                  |
| currentPage       | String \| undefined       | The current page being viewed.                                              |
| post              | YpPostData \| undefined   | The post data.                                                              |
| scrollToPointId   | Number \| undefined       | The ID of the point to scroll to within the post.                           |
| debateCount       | String \| undefined       | The count of debates related to the post.                                   |
| photosCount       | String \| undefined       | The count of photos related to the post.                                    |

## Methods

| Name                        | Parameters                  | Return Type | Description                                                                 |
|-----------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| scrollToCollectionItemSubClass | None                        | void        | Placeholder method for scrolling to a collection item subclass.              |
| renderPostHeader            | None                        | TemplateResult | Renders the post header.                                                    |
| renderPostTabs              | None                        | TemplateResult \| undefined | Renders the post tabs. May return `nothing` if tabs are not needed.         |
| renderCurrentPostTabPage    | None                        | TemplateResult \| undefined | Renders the current post tab page. May return `undefined` if no post.       |
| render                      | None                        | TemplateResult | Renders the entire post component.                                          |
| _selectedTabChanged         | None                        | void        | Handles changes to the selected tab.                                        |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element’s properties have changed.       |
| isPostPage                  | None                        | boolean     | Checks if the current page is the post page.                                |
| _newPost                    | None                        | void        | Handles the creation of a new post.                                         |
| connectedCallback           | None                        | void        | Lifecycle method called when the element is added to the document’s DOM.    |
| disconnectedCallback        | None                        | void        | Lifecycle method called when the element is removed from the document’s DOM.|
| _updatePostImageCount       | event: CustomEvent          | void        | Updates the post image count based on an event.                             |
| _updateDebateInfo           | event: CustomEvent          | void        | Updates the debate info based on an event.                                  |
| _mainContainerClasses       | None                        | string      | Returns the classes for the main container based on the `wide` property.    |
| _headerClasses              | None                        | string      | Returns the classes for the header based on the `wide` property.            |
| postName                    | None                        | string \| undefined | Returns the truncated and formatted post name.                              |
| postDescription             | None                        | string      | Returns the truncated and formatted post description.                       |
| _getPost                    | None                        | Promise<void> | Asynchronously retrieves the post data.                                     |
| collectionIdChanged         | None                        | void        | Handles changes to the collection ID.                                       |
| _processIncomingPost        | fromCache: boolean = false  | void        | Processes the incoming post data, optionally from cache.                    |
| _processRecommendation      | recommendedPost: YpPostData | void        | Processes the recommended post data.                                        |
| refresh                     | None                        | void        | Refreshes the post data and updates related properties.                     |

## Events (if any)

- **yp-debate-info**: Emitted when debate information needs to be updated.
- **yp-post-image-count**: Emitted when the post image count needs to be updated.
- **yp-change-header**: Emitted when the header needs to be changed.
- **yp-set-next-post**: Emitted when setting the next post in a sequence.
- **yp-set-home-link**: Emitted when setting the home link data.
- **yp-new-post**: Emitted when a new post is created.

## Examples

```typescript
// Example usage of the YpPost class
const ypPostElement = document.createElement('yp-post');
ypPostElement.isAdmin = true;
ypPostElement.disableNewPosts = false;
ypPostElement.currentPage = 'post';
ypPostElement.post = {
  id: 123,
  name: 'Example Post',
  description: 'This is an example post description.',
  // ... other post data properties
};
ypPostElement.scrollToPointId = 456;
ypPostElement.debateCount = '10';
ypPostElement.photosCount = '5';
document.body.appendChild(ypPostElement);
```

Note: The example above is a simplified usage scenario. In a real-world application, the `ypPostElement` would be used within a larger context where its properties and methods interact with other components and services.