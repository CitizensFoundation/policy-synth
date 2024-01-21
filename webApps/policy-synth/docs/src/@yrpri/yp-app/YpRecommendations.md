# YpRecommendations

The `YpRecommendations` class is responsible for managing post recommendations, including caching, pre-caching media, and handling recommendation callbacks. It extends the `YpCodeBase` class and interacts with the `YpServerApi` to fetch recommendations.

## Properties

| Name                              | Type                                      | Description                                           |
|-----------------------------------|-------------------------------------------|-------------------------------------------------------|
| recommendationsGroupCache         | Record<number,Array<YpPostData>>          | Cache of recommendations grouped by ID.               |
| recommendationsSeenPostIds        | object \| undefined                       | Object to track seen post IDs for recommendations.    |
| recommendationCallbacks           | Record<number,Function>                   | Callbacks for recommendation updates.                 |
| lastRecommendationResponseLengths | Record<number,number>                     | Record of the last recommendation response lengths.   |
| currentPostId                     | number \| undefined                       | The ID of the current post.                           |
| currentlyDownloadingIds           | Record<number,boolean>                    | Record of post IDs that are currently being downloaded. |
| preCacheLimit                     | number                                    | Limit for how many items to pre-cache.                |
| serverApi                         | YpServerApi                               | Instance of `YpServerApi` for server interactions.    |

## Methods

| Name                          | Parameters                                  | Return Type | Description                                                                 |
|-------------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| getNextRecommendationForGroup | groupId: number, currentPostId: number, recommendationCallback: Function | void        | Fetches the next recommendation for a group and invokes the callback.       |
| _preCacheMediaForPost         | post: YpPostData                            | void        | Pre-caches media for a given post.                                          |
| _getImageFormatUrl            | images: Array<YpImageData>\|undefined, formatId: number | string      | Returns the URL for a specific image format.                                |
| _getCategoryImagePath         | post: YpPostData                            | string      | Returns the image path for a post's category icon.                          |
| _downloadItemToCache          | postId: number                              | void        | Downloads a post to the cache.                                              |
| _ensureNextItemsAreCached     | groupId: number                             | void        | Ensures that the next items in the recommendation list are cached.          |
| _getRecommendationsForGroup   | groupId: number                             | Promise<void> | Fetches recommendations for a group and updates the cache.                  |
| _getSelectedPost              | groupId: number                             | YpPostData \| null | Selects the next post from the recommendations cache.                      |
| reset                         |                                             | void        | Resets the recommendation caches and related properties.                    |

## Examples

```typescript
// Example usage of YpRecommendations class
const serverApi = new YpServerApi();
const recommendations = new YpRecommendations(serverApi);

// To get the next recommendation for a group
recommendations.getNextRecommendationForGroup(1, 123, (selectedPost) => {
  if (selectedPost) {
    console.log('Next recommendation:', selectedPost);
  } else {
    console.log('No more recommendations available.');
  }
});

// To reset the recommendations cache and state
recommendations.reset();
```