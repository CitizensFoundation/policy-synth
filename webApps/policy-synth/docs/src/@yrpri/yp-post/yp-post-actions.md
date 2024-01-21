# YpPostActions

This class represents a custom web component that provides action buttons for a post, such as voting and debating. It extends `YpBaseElement` and includes properties for configuring the appearance and behavior of the action buttons.

## Properties

| Name                        | Type                  | Description                                                                 |
|-----------------------------|-----------------------|-----------------------------------------------------------------------------|
| post                        | YpPostData            | The post data associated with the action buttons.                           |
| endorsementButtons          | String                | The style of endorsement buttons to use ('hearts', 'thumbs', etc.).         |
| headerMode                  | Boolean               | Whether the component is in header mode.                                    |
| forceSmall                  | Boolean               | Forces the use of small icons.                                               |
| endorseValue                | Number                | The current endorsement value for the post.                                  |
| allDisabled                 | Boolean               | Whether all action buttons are disabled.                                     |
| disabledTitle               | String \| undefined   | The title to show when the action buttons are disabled.                      |
| floating                    | Boolean               | Whether the action bar is floating.                                          |
| votingDisabled              | Boolean               | Whether voting is disabled.                                                  |
| smallerIcons                | Boolean               | Whether smaller icons should be used.                                        |
| maxNumberOfGroupVotes       | Number \| undefined   | The maximum number of votes a user can cast in a group.                      |
| numberOfGroupVotes          | Number \| undefined   | The current number of votes a user has cast in a group.                      |
| forceShowDebate             | Boolean               | Forces the debate button to be shown.                                        |

## Methods

| Name                        | Parameters            | Return Type | Description                                                                 |
|-----------------------------|-----------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback           | None                  | void        | Lifecycle method called when the component is added to the DOM.             |
| disconnectedCallback        | None                  | void        | Lifecycle method called when the component is removed from the DOM.          |
| firstUpdated                | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component's first render. |
| render                      | None                  | TemplateResult | Renders the HTML template for the component.                              |
| isEndorsed                  | None                  | Boolean     | Getter that returns true if the post is endorsed.                           |
| votingStateDisabled         | None                  | Boolean     | Getter that returns true if voting is disabled.                             |
| onlyUpVoteShowing           | None                  | Boolean     | Getter that returns true if only the upvote button should be shown.         |
| endorseModeIconUp           | None                  | String      | Getter that returns the icon for the upvote button based on the endorsement button style. |
| endorseModeIconDown         | None                  | String      | Getter that returns the icon for the downvote button based on the endorsement button style. |
| customVoteUpHoverText       | None                  | String      | Getter that returns the hover text for the upvote button.                   |
| customVoteDownHoverText     | None                  | String      | Getter that returns the hover text for the downvote button.                 |
| _goToPostIfNotHeader        | None                  | void        | Navigates to the post if the component is not in header mode.               |
| hideDebate                  | None                  | Boolean     | Getter that returns true if the debate button should be hidden.             |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component's properties have changed. |
| _updateEndorsementsFromSignal | event: CustomEvent   | void        | Updates the endorsement status based on an event signal.                     |
| _updateEndorsements         | event: CustomEvent \| undefined | void | Updates the endorsement status.                                           |
| endorseModeIcon             | endorsementButtons: String, upDown: String | String | Returns the appropriate icon based on the endorsement button style and direction. |
| _setEndorsement             | value: Number         | void        | Sets the endorsement value and updates the UI accordingly.                   |
| _enableVoting               | None                  | void        | Enables voting if it is not disabled.                                       |
| generateEndorsementFromLogin | value: Number         | void        | Generates an endorsement if the user is logged in and has not already endorsed the post. |
| generateEndorsement         | value: Number         | Promise<void> | Generates an endorsement for the post.                                      |
| upVote                      | None                  | void        | Handles the upvote action.                                                  |
| downVote                    | None                  | void        | Handles the downvote action.                                                |
| _setVoteHidingStatus        | None                  | void        | Updates the visibility of the vote count based on the group configuration.   |

## Events (if any)

- **yp-got-endorsements-and-qualities**: Emitted when the endorsement and quality data is received.

## Examples

```typescript
// Example usage of the YpPostActions component
<yp-post-actions .post=${post} endorsementButtons="hearts"></yp-post-actions>
```

Note: The `YpPostData`, `YpEndorseResponse`, and other types used in the properties and methods are not defined in this documentation and should be defined elsewhere in the project's type definitions.