# YpPostHeader

The `YpPostHeader` class is a custom web component that extends `YpPostBaseWithAnswers` and `YpBaseElementWithLogin` to provide a header for a post with various functionalities such as editing, deleting, sharing, and displaying post information. It includes a cover media display, post information, actions, and a menu for additional options.

## Properties

| Name             | Type    | Description                                                                 |
|------------------|---------|-----------------------------------------------------------------------------|
| isAudioCover     | Boolean | Indicates if the cover media is audio.                                      |
| hideActions      | Boolean | Determines whether to hide the action buttons.                              |
| transcriptActive | Boolean | Indicates if the transcript for the post is active.                         |
| post             | Object  | The post data object containing all the information about the post.         |

## Methods

| Name                     | Parameters | Return Type | Description                                                                 |
|--------------------------|------------|-------------|-----------------------------------------------------------------------------|
| _openPostMenu            |            | void        | Opens the post menu with various options like edit, delete, report, etc.    |
| _sharedContent           | event: CustomEvent | void | Handles the shared content event.                                           |
| _shareTap                | event: CustomEvent | void | Handles the share tap event and opens the share dialog.                     |
| hasPostAccess            |            | Boolean     | Checks if the user has access to the post based on their permissions.       |
| updated                  | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called when the properties of the component have changed. |
| _postChanged             |            | void        | Called when the post property changes.                                      |
| updateDescriptionIfEmpty | description: string | void | Updates the post description if it is empty.                                |
| _refresh                 |            | void        | Refreshes the component.                                                    |
| _openMovePost            |            | void        | Opens the dialog to move the post to a different group.                     |
| _openPostStatusChangeNoEmails |      | void        | Opens the dialog to change the post status without sending emails.          |
| _openPostStatusChange    |            | void        | Opens the dialog to change the post status.                                 |
| _openEdit                |            | void        | Opens the edit dialog for the post.                                         |
| _openReport              |            | void        | Opens the report dialog for the post.                                       |
| _openDelete              |            | void        | Opens the delete confirmation dialog for the post.                          |
| _openDeleteContent       |            | void        | Opens the delete content dialog for the post.                               |
| _openAnonymizeContent    |            | void        | Opens the anonymize content dialog for the post.                            |
| _onReport                |            | void        | Callback for when a report action is completed.                             |
| _onDeleted               |            | void        | Callback for when a delete action is completed.                             |

## Events

- **yp-refresh-group**: Emitted when the group needs to be refreshed after a post action.
- **openPostMenu**: Emitted when the post menu is opened.

## Examples

```typescript
// Example usage of the YpPostHeader component
<yp-post-header
  .post="${this.postData}"
  .isAudioCover="${this.isAudio}"
  .hideActions="${false}"
  .transcriptActive="${this.hasTranscript}"
></yp-post-header>
```

Note: The actual rendering and event handling are done using LitElement's `html` and `@click` directives within the `render` method and other related methods. The properties and methods listed above are part of the component's public API and are used for interaction with the component.