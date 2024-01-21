# YpNavHelpers

A utility class providing navigation helper methods for redirecting to specific paths or posts within an application.

## Methods

| Name         | Parameters                                                                 | Return Type | Description                                                                                   |
|--------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| redirectTo   | path: string                                                               | void        | Logs an error instead of redirecting to the given path and dispatches a pause media event.    |
| goToPost     | postId: number, pointId: number \| undefined, cachedActivityItem: AcActivityData \| undefined, cachedPostItem: YpPostData \| undefined, skipKeepOpen: boolean | void        | Navigates to a post by its ID, with optional details and caching, and handles redirection.    |

## Events

- **yp-pause-media-playback**: Dispatched when the `redirectTo` method is called to signal that media playback should be paused.

## Examples

```typescript
// Example usage of redirectTo method
YpNavHelpers.redirectTo('/some/path');

// Example usage of goToPost method
YpNavHelpers.goToPost(123);
YpNavHelpers.goToPost(123, 456);
YpNavHelpers.goToPost(123, undefined, someCachedActivityItem);
YpNavHelpers.goToPost(123, undefined, undefined, someCachedPostItem);
YpNavHelpers.goToPost(123, undefined, undefined, undefined, true);
```