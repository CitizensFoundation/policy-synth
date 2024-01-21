# YpPostCoverMedia

The `YpPostCoverMedia` class is a custom element that displays various types of media associated with a post, such as images, videos, audio, maps, and street views. It extends from `YpBaseElement` and utilizes the `lit` library for rendering.

## Properties

| Name                        | Type                  | Description                                                                 |
|-----------------------------|-----------------------|-----------------------------------------------------------------------------|
| post                        | YpPostData            | The post data object containing media and other related information.        |
| topRadius                   | boolean               | Determines if the top radius styling should be applied.                     |
| topLeftRadius               | boolean               | Determines if the top left radius styling should be applied.                |
| altTag                      | string \| undefined   | Alternative text for images.                                                |
| postAudioId                 | number \| undefined   | The ID of the audio associated with the post.                               |
| postVideoId                 | number \| undefined   | The ID of the video associated with the post.                               |
| headerMode                  | boolean               | Indicates if the element is in header mode.                                 |
| disableMaps                 | boolean               | Determines if maps should be disabled.                                      |
| mapActivated                | boolean               | Indicates if the map is activated.                                          |
| streetViewActivated         | boolean               | Indicates if the street view is activated.                                  |
| tiny                        | boolean               | Determines if the category icon should be displayed in a tiny size.         |
| staticMapsApiKey            | string                | The API key for Google Static Maps.                                         |
| uploadedDefaultPostImageId  | number \| undefined   | The ID of the default post image uploaded by the group.                     |
| defaultImageGroupId         | number \| undefined   | The ID of the group associated with the default post image.                 |
| defaultPostImageEnabled     | boolean               | Indicates if the default post image is enabled.                             |
| showVideo                   | boolean               | Determines if the video should be displayed.                                |
| showAudio                   | boolean               | Determines if the audio should be displayed.                                |
| portraitVideo               | boolean               | Indicates if the video is in portrait mode.                                 |
| playStartedAt               | Date \| undefined     | The date and time when playback started.                                    |
| videoPlayListener           | Function \| undefined | Listener function for video play events.                                    |
| videoPauseListener          | Function \| undefined | Listener function for video pause events.                                   |
| videoEndedListener          | Function \| undefined | Listener function for video ended events.                                   |
| audioPlayListener           | Function \| undefined | Listener function for audio play events.                                    |
| audioPauseListener          | Function \| undefined | Listener function for audio pause events.                                   |
| audioEndedListener          | Function \| undefined | Listener function for audio ended events.                                   |

## Methods

| Name                | Parameters | Return Type | Description                                                                 |
|---------------------|------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback   |            | void        | Lifecycle method that runs when the element is added to the DOM.            |
| disconnectedCallback|            | void        | Lifecycle method that runs when the element is removed from the DOM.         |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the element's properties change. |
| render              |            | TemplateResult | Renders the element's HTML template.                                      |
| sizingMode          |            | string      | Determines the sizing mode for images based on the group's configuration.   |
| activeDefaultImageUrl |          | string \| undefined | Returns the URL for the active default post image if enabled.             |
| _goToPost           |            | void        | Navigates to the post when an element is clicked.                           |
| latitude            |            | number      | Retrieves the latitude from the post's location.                            |
| longitude           |            | number      | Retrieves the longitude from the post's location.                           |
| isNoneActive        |            | boolean     | Checks if the 'none' media type is active for the post.                     |
| isCategoryActive    |            | boolean     | Checks if the 'category' media type is active for the post.                 |
| _isDomainWithOldCategories |    | boolean     | Helper method to support old square category images.                        |
| isCategoryLargeActive |          | boolean     | Checks if the 'category' media type is active with large images.            |
| isImageActive       |            | boolean     | Checks if the 'image' media type is active for the post.                    |
| isVideoActive       |            | boolean     | Checks if the 'video' media type is active for the post.                    |
| isAudioActive       |            | boolean     | Checks if the 'audio' media type is active for the post.                    |
| isMapActive         |            | boolean     | Checks if the 'map' media type is active for the post.                      |
| isStreetViewActive  |            | boolean     | Checks if the 'streetView' media type is active for the post.               |
| zoomLevel           |            | string      | Retrieves the zoom level for maps from the post's location.                  |
| mapType             |            | string      | Retrieves the map type from the post's location.                            |
| _withCoverMediaType | post: YpPostData, mediaType: string | boolean | Helper method to check the cover media type of the post.          |
| mapPosition         |            | Object      | Retrieves the map position from the post's location.                        |
| postImagePath       |            | string      | Retrieves the image path for the post's header image.                       |
| postVideoPath       |            | string \| undefined | Retrieves the video path for the post's video.                           |
| postAudioPath       |            | string \| undefined | Retrieves the audio path for the post's audio.                           |
| postVideoPosterPath |            | string \| undefined | Retrieves the video poster path for the post's video.                   |
| categoryImagePath   |            | string      | Retrieves the image path for the post's category icon.                      |

## Events (if any)

- **yp-pause-media-playback**: Emitted when media playback should be paused.

## Examples

```typescript
// Example usage of the YpPostCoverMedia custom element
<yp-post-cover-media .post="${post}" headerMode></yp-post-cover-media>
```

Note: The actual usage of the custom element would depend on the context within a web application where the `post` object is provided with the necessary data.