# YpMediaHelpers

This class provides static helper methods for managing media playback and related functionalities.

## Methods

| Name                        | Parameters                                      | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| _checkVideoLongPlayTimeAndReset | playbackElement: YpElementWithPlayback, videoPlayer: HTMLElement | void        | Checks if a video has been played for a significant time and resets playback. |
| _checkAudioLongPlayTimeAndReset | playbackElement: YpElementWithPlayback, audioPlayer: HTMLElement | void        | Checks if an audio has been played for a significant time and resets playback. |
| getImageFormatUrl           | images: Array<YpImageData> \| undefined, formatId: number = 0 | string      | Returns the URL of the image in the specified format.                       |
| setupTopHeaderImage         | element: YpBaseElement, images: Array<YpImageData> \| null | void        | Sets up the top header image for an element.                                |
| attachMediaListeners        | targetElement: YpElementWithPlayback             | void        | Attaches media event listeners to the target element.                       |
| detachMediaListeners        | targetElement: YpElementWithPlayback             | void        | Detaches media event listeners from the target element.                     |
| pauseMediaPlayback          | targetElement: YpElementWithPlayback             | void        | Pauses media playback on the target element.                                |
| getVideoURL                 | videos: Array<YpVideoData> \| undefined          | string \| null | Returns the URL of the video.                                               |
| isPortraitVideo             | videos: Array<YpVideoData> \| undefined          | boolean     | Determines if the video is in portrait mode.                                |
| getAudioURL                 | audios: Array<YpAudioData> \| undefined          | string \| null | Returns the URL of the audio.                                               |
| getVideoPosterURL           | videos: Array<YpVideoData> \| undefined, images: Array<YpImageData> \| undefined, selectedImageIndex: number = 0 | string \| null | Returns the URL of the video poster image.                                  |

## Examples

```typescript
// Example usage of attaching media listeners to an element
YpMediaHelpers.attachMediaListeners(someElementWithPlayback);

// Example usage of detaching media listeners from an element
YpMediaHelpers.detachMediaListeners(someElementWithPlayback);

// Example usage of pausing media playback on an element
YpMediaHelpers.pauseMediaPlayback(someElementWithPlayback);

// Example usage of getting a video URL from an array of YpVideoData
const videoUrl = YpMediaHelpers.getVideoURL(someArrayOfYpVideoData);

// Example usage of checking if a video is in portrait mode
const isPortrait = YpMediaHelpers.isPortraitVideo(someArrayOfYpVideoData);

// Example usage of getting an audio URL from an array of YpAudioData
const audioUrl = YpMediaHelpers.getAudioURL(someArrayOfYpAudioData);

// Example usage of getting a video poster URL
const posterUrl = YpMediaHelpers.getVideoPosterURL(someArrayOfYpVideoData, someArrayOfYpImageData);
```

Note: The actual implementation of `YpElementWithPlayback`, `YpImageData`, `YpVideoData`, and `YpAudioData` is not provided in the documentation. These should be defined elsewhere in the codebase.