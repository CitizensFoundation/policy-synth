# YpPostTranscript

`YpPostTranscript` is a custom element that handles the display and editing of transcripts for posts. It allows users to view automatic transcripts, edit them if they have the appropriate access, and check the status of transcript generation.

## Properties

| Name                | Type      | Description                                                                 |
|---------------------|-----------|-----------------------------------------------------------------------------|
| isEditing           | Boolean   | Indicates if the transcript is currently being edited.                      |
| editText            | String    | The text that is being edited.                                              |
| checkingTranscript  | Boolean   | Indicates if the transcript status is currently being checked.              |
| checkTranscriptError| Boolean   | Indicates if there was an error while checking the transcript status.       |
| post                | YpPostData| The post data object containing information about the post and its transcript. |

## Methods

| Name                  | Parameters | Return Type | Description                                                                 |
|-----------------------|------------|-------------|-----------------------------------------------------------------------------|
| _isEditingChanged     |            | void        | Updates emoji bindings and triggers a resize event when editing state changes. |
| _updateEmojiBindings  |            | void        | Binds emoji selector to the text input if editing is enabled.               |
| _cancelEdit           |            | void        | Cancels the editing of the transcript.                                      |
| _saveEdit             |            | Promise<void> | Saves the edited transcript content.                                        |
| _editPostTranscript   |            | void        | Enables editing mode for the transcript.                                    |
| _checkTranscriptStatus|            | Promise<void> | Checks the status of the transcript generation and updates the UI accordingly. |
| hasPostAccess         |            | Boolean    | Checks if the current user has access to edit the post.                     |
| _postChanged          |            | void        | Handles changes to the post property.                                       |

## Events

- **iron-resize**: Emitted when the element needs to notify the layout system that it has changed size.

## Examples

```typescript
// Example usage of YpPostTranscript
<yp-post-transcript .post=${post}></yp-post-transcript>
```

Please note that the above example assumes that `post` is a variable containing the post data with a transcript.