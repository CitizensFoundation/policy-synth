# YpPostCard

A custom web component that represents a post card, displaying various information about a post such as its cover media, name, description, tags, and actions. It is designed to be used within a web application that handles posts, possibly in a social media or content sharing context.

## Properties

| Name              | Type                  | Description                                                                 |
|-------------------|-----------------------|-----------------------------------------------------------------------------|
| selectedMenuItem  | string \| undefined   | The currently selected menu item.                                           |
| mini              | boolean               | Determines if the post card should be displayed in a miniaturized version.  |
| isAudioCover      | boolean               | Indicates if the cover media is of type audio.                              |
| post              | YpPostData            | The post data object containing all the information about the post.         |

## Methods

| Name                      | Parameters | Return Type | Description                                                                                   |
|---------------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| renderDescription         |            | TemplateResult | Generates the HTML template for the post description.                                         |
| renderTags                |            | TemplateResult | Generates the HTML template for the post tags.                                                |
| render                    |            | TemplateResult | The main render method that returns the template for the entire post card.                    |
| _sharedContent            | event: CustomEvent | void        | Handles the shared content event when a post is shared.                                       |
| _fullPostUrl              |            | string       | Computes the full URL for the post.                                                           |
| structuredAnswersFormatted |            | string       | Formats the structured answers associated with the post.                                      |
| _onBottomClick            | event: CustomEvent | void        | Handles click events on the bottom part of the post card.                                     |
| clickOnA                  |            | void        | Simulates a click on the main area of the post card.                                          |
| _getPostLink              | post: YpPostData | string \| undefined | Generates the link to the post's page.                                                      |
| _shareTap                 | event: CustomEvent | void        | Handles the tap event on the share button.                                                    |
| hideDescription           |            | boolean     | Determines whether the post description should be hidden based on various conditions.         |
| goToPostIfNotHeader       | event: CustomEvent | void        | Navigates to the post's page unless certain conditions are met.                               |
| updated                   | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs when the component's properties have changed.                   |
| updateDescriptionIfEmpty  | description: string | void        | Updates the post's description if it is empty.                                                |
| _refresh                  |            | void        | Refreshes the post card, typically after an edit dialog.                                      |
| _openReport               |            | void        | Opens the report dialog for reporting the post.                                               |
| _onReport                 |            | void        | Callback for when a report action is completed.                                               |

## Events (if any)

- **refresh**: Emitted when the post card needs to be refreshed.
- **postShared**: Emitted when a post is shared, with details about the sharing action.

## Examples

```typescript
// Example usage of the YpPostCard component
<yp-post-card .post="${postObject}"></yp-post-card>
```

Note: The `YpPostData`, `YpStructuredQuestionData`, `YpShareDialogData`, and other types referenced in the documentation are assumed to be defined elsewhere in the application's codebase and are not detailed here.