# YpPoint

The `YpPoint` class is a custom web component that represents a point in a discussion or debate. It extends from `YpBaseElement` and is designed to be used within the Your Priorities app. It displays the content of a point, the user who made the point, and various actions related to the point such as editing, deleting, and reporting. It also handles media playback for associated videos and audio clips.

## Properties

| Name                                 | Type                  | Description                                                                                   |
|--------------------------------------|-----------------------|-----------------------------------------------------------------------------------------------|
| point                                | YpPointData           | The data object representing the point.                                                       |
| post                                | YpPostData            | The data object representing the post to which the point belongs.                             |
| user                                | YpUserData \| undefined | The data object representing the user who made the point.                                     |
| linkPoint                            | boolean               | Indicates whether the point should act as a link to a detailed view.                          |
| openTranscript                       | boolean               | Indicates whether the transcript of the point's media should be open by default.              |
| hideUser                             | boolean               | Determines whether to hide the user information.                                              |
| hideActions                          | boolean               | Determines whether to hide the action buttons related to the point.                           |
| isEditing                            | boolean               | Indicates whether the point is currently being edited.                                        |
| isAdminCommentEditing                | boolean               | Indicates whether the admin comment on the point is currently being edited.                   |
| hasAdminComments                     | boolean               | Indicates whether the point has admin comments.                                               |
| maxNumberOfPointsBeforeEditFrozen    | number                | The maximum number of points before editing is frozen.                                        |
| editText                             | string \| undefined   | The text that is being edited.                                                                |
| editAdminCommentText                 | string \| undefined   | The admin comment text that is being edited.                                                  |
| videoActive                          | boolean               | Indicates whether a video is associated with the point and should be active.                  |
| pointVideoPath                       | string \| undefined   | The path to the video associated with the point.                                              |
| pointImageVideoPath                  | string \| undefined   | The path to the video's poster image.                                                         |
| pointVideoId                         | number \| undefined   | The ID of the video associated with the point.                                                |
| audioActive                          | boolean               | Indicates whether an audio clip is associated with the point and should be active.            |
| pointAudioPath                       | string \| undefined   | The path to the audio clip associated with the point.                                         |
| pointAudioId                         | number \| undefined   | The ID of the audio clip associated with the point.                                           |
| checkingTranscript                   | boolean               | Indicates whether the transcript for the point's media is being checked.                      |
| portraitVideo                        | boolean               | Indicates whether the video associated with the point is in portrait mode.                    |
| checkTranscriptError                 | boolean               | Indicates whether there was an error checking the transcript for the point's media.           |
| playStartedAt                        | Date \| undefined     | The date and time when media playback started.                                                |
| videoPlayListener                    | Function \| undefined | A function to handle the video play event.                                                    |
| videoPauseListener                   | Function \| undefined | A function to handle the video pause event.                                                   |
| videoEndedListener                   | Function \| undefined | A function to handle the video ended event.                                                   |
| audioPlayListener                    | Function \| undefined | A function to handle the audio play event.                                                    |
| audioPauseListener                   | Function \| undefined | A function to handle the audio pause event.                                                   |
| audioEndedListener                   | Function \| undefined | A function to handle the audio ended event.                                                   |

## Methods

| Name                  | Parameters | Return Type | Description                                                                 |
|-----------------------|------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |            | void        | Lifecycle method called when the component is added to the DOM.             |
| disconnectedCallback  |            | void        | Lifecycle method called when the component is removed from the DOM.         |
| updated               | Map        | void        | Lifecycle method called when the component's properties have changed.       |
| renderAdminComments   |            | TemplateResult | Renders the admin comments section of the point.                            |
| renderUserHeader      |            | TemplateResult | Renders the header section with user information.                           |
| renderTextPoint       |            | TemplateResult | Renders the text content of the point.                                      |
| renderVideoOrAudio    |            | TemplateResult | Renders the video or audio content associated with the point.               |
| renderEditPoint       |            | TemplateResult | Renders the edit interface for the point.                                   |
| renderEditMenu        |            | TemplateResult | Renders the edit menu for the point.                                        |
| render                |            | TemplateResult | Renders the entire component.                                               |
| _setOpen              |            | void        | Opens the transcript section.                                               |
| _setClosed            |            | void        | Closes the transcript section.                                              |
| _isEditingChanged     |            | void        | Called when the `isEditing` property changes.                               |
| _isAdminCommentEditingChanged |   | void        | Called when the `isAdminCommentEditing` property changes.                   |
| _shareTap             | CustomEvent | void        | Handles the share tap event.                                                |
| _linkIfNeeded         |            | void        | Navigates to the detailed view if `linkPoint` is true.                      |
| _updateEmojiBindings  |            | void        | Updates the emoji bindings for the edit interfaces.                         |
| _cancelEdit           |            | void        | Cancels the editing of the point.                                           |
| _saveEdit             |            | Promise<void> | Saves the edited content of the point.                                      |
| _cancelAdminCommentEdit |          | void        | Cancels the editing of the admin comment.                                   |
| _saveAdminCommentEdit |            | Promise<void> | Saves the edited admin comment.                                             |
| _deletePoint          |            | void        | Initiates the deletion of the point.                                        |
| _reallyDeletePoint    |            | Promise<void> | Confirms and carries out the deletion of the point.                         |
| _reportPoint          |            | void        | Initiates the reporting of the point.                                       |
| _onReport             |            | void        | Handles the report confirmation.                                            |
| _editPoint            |            | void        | Initiates the editing of the point.                                         |
| _editAdminComment     |            | void        | Initiates the editing of the admin comment.                                 |
| firstUpdated          | Map        | void        | Lifecycle method called after the component's first render.                 |
| _pauseMediaPlayback   |            | void        | Pauses media playback.                                                      |
| _pointChanged         |            | void        | Called when the `point` property changes.                                   |
| _checkTranscriptStatus |            | Promise<void> | Checks the status of the transcript for the point's media.                  |
| _resetMedia           |            | void        | Resets the media-related properties.                                        |
| loginName             |            | string \| undefined | Returns the name of the user who made the point.                            |
| isUpVote              |            | boolean     | Determines if the point is an upvote.                                       |
| isDownVote            |            | boolean     | Determines if the point is a downvote.                                      |

## Events (if any)

- **yp-got-admin-rights**: Emitted when the user gets admin rights.
- **yp-logged-in**: Emitted when the user logs in.
- **yp-pause-media-playback**: Emitted to pause media playback.
- **yp-point-deleted**: Emitted when a point is deleted.
- **yp-update-point-in-list**: Emitted when a point is updated in a list.
- **yp-list-resize**: Emitted when the list needs to be resized.

## Examples

```typescript
// Example usage of the YpPoint component
<yp-point .point="${this.pointData}" .post="${this.postData}" .user="${this.userData}"></yp-point>
```

Note: The above example assumes that `pointData`, `postData`, and `userData` are existing variables containing the relevant data for the point, post, and user respectively.