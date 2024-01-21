# YpPostPoints

This class represents a component that allows users to post points for or against a topic within a debate. It handles the creation, display, and management of points, including text, audio, and video points.

## Properties

| Name                      | Type                                  | Description                                                                 |
|---------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| fetchActive               | Boolean                               | Indicates if the component is currently fetching data.                      |
| isAdmin                   | Boolean                               | Determines if the current user has admin privileges.                        |
| disableDebate             | Boolean                               | If true, disables the ability to debate.                                    |
| points                    | Array<YpPointData> \| undefined       | An array of points to be displayed.                                         |
| downPoints                | Array<YpPointData> \| undefined       | An array of points against the topic.                                       |
| upPoints                  | Array<YpPointData> \| undefined       | An array of points for the topic.                                           |
| newPointTextCombined      | String \| undefined                   | Combined text of a new point.                                               |
| post                      | YpPostData                            | The post data associated with the points.                                   |
| labelMobileUpOrDown       | String \| undefined                   | Label for mobile up or down points.                                         |
| labelUp                   | String \| undefined                   | Label for up points.                                                        |
| labelDown                 | String \| undefined                   | Label for down points.                                                      |
| pointUpOrDownSelected     | String                                | Indicates if the point is for or against.                                   |
| latestPointCreatedAt      | Date \| undefined                     | The creation date of the latest point.                                      |
| scrollToId                | Number \| undefined                   | ID of the point to scroll into view.                                        |
| addPointDisabled          | Boolean                               | If true, disables the ability to add a new point.                           |
| uploadedVideoUpId         | Number \| undefined                   | ID of the uploaded video for up points.                                     |
| uploadedVideoDownId       | Number \| undefined                   | ID of the uploaded video for down points.                                   |
| uploadedVideoMobileId     | Number \| undefined                   | ID of the uploaded video for mobile points.                                 |
| currentVideoId            | Number \| undefined                   | ID of the current video.                                                    |
| hideUpVideo               | Boolean                               | If true, hides the video upload for up points.                              |
| hideDownVideo             | Boolean                               | If true, hides the video upload for down points.                            |
| hideMobileVideo           | Boolean                               | If true, hides the video upload for mobile points.                          |
| uploadedAudioUpId         | Number \| undefined                   | ID of the uploaded audio for up points.                                     |
| uploadedAudioDownId       | Number \| undefined                   | ID of the uploaded audio for down points.                                   |
| uploadedAudioMobileId     | Number \| undefined                   | ID of the uploaded audio for mobile points.                                 |
| currentAudioId            | Number \| undefined                   | ID of the current audio.                                                    |
| hideUpAudio               | Boolean                               | If true, hides the audio upload for up points.                              |
| hideDownAudio             | Boolean                               | If true, hides the audio upload for down points.                            |
| hideMobileAudio           | Boolean                               | If true, hides the audio upload for mobile points.                          |
| hideUpText                | Boolean                               | If true, hides the text input for up points.                                |
| hideDownText              | Boolean                               | If true, hides the text input for down points.                              |
| hideMobileText            | Boolean                               | If true, hides the text input for mobile points.                            |
| selectedPointForMobile    | Boolean                               | Indicates if the selected point for mobile is for or against.               |
| isAndroid                 | Boolean                               | Determines if the user is on an Android device.                             |
| hasCurrentUpVideo         | String \| undefined                   | Indicates if there is a current video for up points.                        |
| hasCurrentDownVideo       | String \| undefined                   | Indicates if there is a current video for down points.                      |
| hasCurrentMobileVideo     | String \| undefined                   | Indicates if there is a current video for mobile points.                    |
| hasCurrentUpAudio         | String \| undefined                   | Indicates if there is a current audio for up points.                        |
| hasCurrentDownAudio       | String \| undefined                   | Indicates if there is a current audio for down points.                      |
| hasCurrentMobileAudio     | String \| undefined                   | Indicates if there is a current audio for mobile points.                    |
| storedPoints              | Array<YpPointData> \| undefined       | An array of stored points.                                                  |
| loadedPointIds            | Record<number, boolean>               | A record of loaded point IDs.                                               |
| loadMoreInProgress        | Boolean                               | Indicates if more points are currently being loaded.                        |
| totalCount                | Number \| undefined                   | The total count of points.                                                  |
| storedUpPointsCount       | Number                                | The count of stored up points.                                              |
| storedDownPointsCount     | Number                                | The count of stored down points.                                            |
| noMorePoints              | Boolean                               | Indicates if there are no more points to load.                              |

## Methods

| Name                  | Parameters                        | Return Type | Description                                                                 |
|-----------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| renderAudioUpload     | type: string, hideAudio: boolean, hasCurrentAudio: string \| undefined, uploadAudioPointHeader: string | TemplateResult | Renders the audio upload section.                                           |
| renderVideoUpload     | type: string, hideVideo: boolean, hasCurrentVideo: string \| undefined, uploadVideoHeader: string, videoUploadedFunc: Function, uploadedVideoId: number \| undefined | TemplateResult | Renders the video upload section.                                           |
| renderMobilePointSelection | -                             | TemplateResult | Renders the mobile point selection UI.                                      |
| renderPointItem       | point: YpPointData, index: number | TemplateResult | Renders a single point item.                                                |
| renderPointHeader     | header: string, alternativeHeader: string \| undefined, headerTextType: string | TemplateResult | Renders the header for a point section.                                     |
| renderPointList       | type: string, header: string, alternativeHeader: string \| undefined, headerTextType: string, label: string \| undefined, hideVideo: boolean, hideText: boolean, hasCurrentVideo: string \| undefined, videoUploadedFunc: Function, uploadVideoHeader: string, uploadedVideoId: number \| undefined, pointFocusFunction: Function, hideAudio: boolean, hasCurrentAudio: string \| undefined, uploadAudioPointHeader: string, ifLengthIsRight: boolean, addPointFunc: Function, points: Array<YpPointData> \| undefined, mobile: boolean | TemplateResult | Renders a list of points.                                                    |
| renderTranslationPlaceholders | -                             | TemplateResult | Renders placeholders for translations.                                      |
| render                | -                                 | TemplateResult | Renders the component.                                                      |
| addPointUp            | -                                 | void        | Adds a new point for the topic.                                             |
| addPointDown          | -                                 | void        | Adds a new point against the topic.                                         |
| addMobilePointUpOrDown | -                                 | void        | Adds a new mobile point for or against the topic.                           |
| addPoint              | content: string, value: number, videoId: number \| undefined, audioId: number \| undefined | Promise<void> | Adds a new point with the specified content and value.                      |
| focusUpPoint          | -                                 | void        | Focuses on the input field for up points.                                   |
| focusDownPoint        | -                                 | void        | Focuses on the input field for down points.                                 |
| focusMobilePoint      | -                                 | void        | Focuses on the input field for mobile points.                               |
| focusOutlinedTextField | event: CustomEvent               | void        | Focuses on the outlined text field.                                         |
| blurOutlinedTextField | event: CustomEvent                | void        | Blurs the outlined text field.                                              |
| ifLengthUpIsRight     | -                                 | Boolean     | Checks if the length of the up point text is valid.                         |
| ifLengthDownIsRight   | -                                 | Boolean     | Checks if the length of the down point text is valid.                       |
| ifLengthMobileIsRight | -                                 | Boolean     | Checks if the length of the mobile point text is valid.                     |
| ifLengthIsRight       | type: string, textValue: string \| undefined, hasVideoId: number \| undefined, hasAudioId: number \| undefined | Boolean | Checks if the length of the point text is valid based on type.              |

## Events (if any)

- **yp-point-deleted**: Emitted when a point is deleted.
- **yp-update-point-in-list**: Emitted when a point in the list is updated.
- **yp-list-resize**: Emitted when the list needs to be resized.
- **yp-update-points-for-post**: Emitted when new points need to be loaded for a post.

## Examples

```typescript
// Example usage of the YpPostPoints component
<yp-post-points .post="${post}" .isAdmin="${isAdmin}"></yp-post-points>
```
```