# YpFileUpload

An element providing a file upload solution with support for drag-and-drop, progress indication, and retry functionality.

## Properties

| Name                     | Type                          | Description                                                                 |
|--------------------------|-------------------------------|-----------------------------------------------------------------------------|
| target                   | String                        | The target URL to upload the files to.                                      |
| uploadLimitSeconds       | Number \| undefined           | The time limit in seconds for the upload.                                   |
| progressHidden           | Boolean                       | Indicates whether the progress bar should be hidden.                        |
| droppable                | Boolean                       | Indicates whether to allow file drop.                                       |
| dropText                 | String                        | The text to display in the file drop area.                                  |
| multi                    | Boolean                       | Indicates whether to allow multiple files to be uploaded.                   |
| files                    | Array<YpUploadFileData>       | The list of files to be uploaded.                                           |
| method                   | String                        | The HTTP method to be used during upload.                                   |
| raised                   | Boolean                       | Indicates whether the button should be raised.                              |
| subText                  | String \| undefined           | Additional text to display under the upload button.                         |
| noink                    | Boolean                       | Indicates that the button should not have an ink effect.                    |
| headers                  | Record<string, string>        | A key-value map of header names and values.                                 |
| retryText                | String                        | The text for the tooltip to retry an upload.                                |
| removeText               | String                        | The text for the tooltip to remove an upload.                               |
| successText              | String                        | The text for the tooltip of a successful upload.                            |
| errorText                | String                        | The text to display for a failed upload.                                    |
| noDefaultCoverImage      | Boolean                       | Indicates whether to use a default cover image.                             |
| shownDropText            | Boolean                       | Indicates whether the drop text should be shown.                            |
| videoUpload              | Boolean                       | Indicates whether the upload is for a video.                                |
| audioUpload              | Boolean                       | Indicates whether the upload is for an audio file.                          |
| attachmentUpload         | Boolean                       | Indicates whether the upload is for an attachment.                          |
| currentVideoId           | Number \| undefined           | The ID of the current video being uploaded.                                 |
| currentAudioId           | Number \| undefined           | The ID of the current audio being uploaded.                                 |
| transcodingJobId         | Number \| undefined           | The ID of the transcoding job.                                              |
| transcodingComplete      | Boolean                       | Indicates whether transcoding is complete.                                  |
| currentFile              | YpUploadFileData \| undefined | The current file being uploaded.                                            |
| isPollingForTranscoding  | Boolean                       | Indicates whether the component is polling for transcoding status.          |
| indeterminateProgress    | Boolean                       | Indicates whether the progress bar should be indeterminate.                 |
| uploadStatus             | String \| undefined           | The status of the upload.                                                   |
| accept                   | String                        | The types of files that the input can accept.                               |
| group                    | YpGroupData \| undefined      | The group data associated with the upload.                                  |
| capture                  | Boolean                       | Indicates whether the file input should capture media directly.             |
| containerType            | String \| undefined           | The type of container for the upload.                                       |
| selectedVideoCoverIndex  | Number                        | The index of the selected video cover.                                      |
| videoAspect              | String \| undefined           | The aspect ratio of the video.                                              |
| useMainPhotoForVideoCover| Boolean                       | Indicates whether to use the main photo for the video cover.                |
| buttonText               | String                        | The text to display on the upload button.                                   |
| buttonIcon               | String                        | The icon to display on the upload button.                                   |

## Methods

| Name            | Parameters | Return Type | Description                           |
|-----------------|------------|-------------|---------------------------------------|
| clear           |            | void        | Clears the list of files.             |
| setupDrop       |            | void        | Sets up a drop area for file uploads. |
| uploadFile      | file: YpUploadFileData | Promise<void> | Initiates the upload of a file. |
| cancel          | file: YpUploadFileData | void        | Cancels the file upload.              |
| reallyUploadFile| file: YpUploadFileData | void        | Performs the actual file upload.      |

## Events

- **success**: Fired when a response is received with status code 200.
- **error**: Fired when a response is received with a status code other than 200.
- **before-upload**: Fired when a file is about to be uploaded.

## Examples

```typescript
// Example usage of the file upload component
<yp-file-upload target="/path/to/destination" multi></yp-file-upload>
```

Please note that the `YpUploadFileData`, `YpGroupData`, and `StartTranscodingResponse` types are not defined in the provided documentation and should be defined elsewhere in the codebase.