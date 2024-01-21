# LtpAiChatElement

`LtpAiChatElement` is a custom element that extends `PsAiChatElement` to provide functionalities specific to handling AI chat interactions within the context of a larger platform. It includes features for loading and parsing JSON content, rendering suggestions for causes and assumptions, and interacting with an API to add selected items to a current reality tree.

## Properties

| Name                        | Type                  | Description                                                                 |
|-----------------------------|-----------------------|-----------------------------------------------------------------------------|
| parentNodeId                | String                | The ID of the parent node in the current reality tree.                      |
| crtId                       | String \| Number      | The ID of the current reality tree.                                         |
| refinedCausesSuggestions    | String[] \| undefined | An array of refined causes suggestions.                                     |
| lastChainCompletedAsValid   | Boolean               | A flag indicating if the last chain of actions was completed as valid.      |
| lastValidateCauses          | String[] \| undefined | An array of the last validated causes.                                      |
| isCreatingCauses            | Boolean               | A flag indicating if the process of creating causes is currently happening. |
| api                         | LtpServerApi          | An instance of `LtpServerApi` for making API calls.                         |

## Methods

| Name                | Parameters | Return Type | Description                                                                                   |
|---------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| handleJsonLoadingEnd| event: any | void        | Handles the end of JSON loading by parsing the content and updating suggestions accordingly.  |
| addSelected         | -          | Promise<void> | Adds the selected causes and assumptions to the current reality tree.                        |
| isError             | -          | Boolean     | Returns true if the current type is 'error' or 'moderation_error'.                            |
| renderJson          | -          | TemplateResult | Renders the JSON content into the template, including suggestions for causes and assumptions. |

## Events (if any)

- **add-nodes**: Emitted when new nodes are added to the current reality tree.
- **close-add-cause-dialog**: Emitted when the dialog for adding causes should be closed.
- **validate-selected-causes**: Emitted when selected causes need to be validated.
- **scroll-down-enabled**: Emitted to enable scrolling down in the interface.

## Examples

```typescript
// Example usage of LtpAiChatElement
const ltpAiChatElement = document.createElement('ltp-ai-chat-element');
ltpAiChatElement.parentNodeId = '123';
ltpAiChatElement.crtId = '456';
document.body.appendChild(ltpAiChatElement);
```

Note: The above example assumes that the custom element `ltp-ai-chat-element` has been defined and registered in the custom elements registry. The properties `parentNodeId` and `crtId` are set to example values and should be replaced with actual IDs from the current reality tree context.