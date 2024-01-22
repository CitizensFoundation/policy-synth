# LtpAiChatElement

LtpAiChatElement is a custom web component that extends PsAiChatElement, designed to handle the chat interface for a specific application. It includes functionality for loading and parsing JSON content, managing suggestions for causes, and interacting with an API to add selected causes and assumptions.

## Properties

| Name                        | Type                      | Description                                                                 |
|-----------------------------|---------------------------|-----------------------------------------------------------------------------|
| parentNodeId                | String                    | The ID of the parent node in the context of the chat.                       |
| crtId                       | String \| Number          | The ID of the current reality tree being used.                              |
| refinedCausesSuggestions    | String[] \| undefined     | An array of refined cause suggestions.                                      |
| lastChainCompletedAsValid   | Boolean                   | Indicates whether the last chain of actions was completed as valid.         |
| lastValidateCauses          | String[] \| undefined     | An array of the last validated causes.                                      |
| isCreatingCauses            | Boolean                   | Indicates whether the component is currently in the process of creating causes. |

## Methods

| Name                | Parameters | Return Type | Description                                                                                   |
|---------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| handleJsonLoadingEnd| event: any | void        | Handles the end of JSON loading, parsing the content and updating suggestions if applicable.  |
| addSelected         |            | Promise<void> | Adds the selected causes and assumptions to the current reality tree.                        |
| isError             |            | Boolean     | Returns true if the type of the element is 'error' or 'moderation_error'.                     |
| renderJson          |            | TemplateResult | Renders the JSON content into the chat interface, including suggestions and actions.        |

## Events (if any)

- **add-nodes**: Emitted when new nodes are added to the current reality tree.
- **close-add-cause-dialog**: Emitted when the dialog for adding causes should be closed.
- **validate-selected-causes**: Emitted when selected causes need to be validated.
- **scroll-down-enabled**: Emitted to enable scrolling down in the chat interface.

## Examples

```typescript
// Example usage of the LtpAiChatElement
const ltpAiChatElement = document.createElement('ltp-ai-chat-element');
ltpAiChatElement.parentNodeId = '123';
ltpAiChatElement.crtId = '456';
ltpAiChatElement.refinedCausesSuggestions = ['Cause 1', 'Cause 2'];
ltpAiChatElement.lastChainCompletedAsValid = true;
ltpAiChatElement.lastValidateCauses = ['Validated Cause 1'];
ltpAiChatElement.isCreatingCauses = false;
document.body.appendChild(ltpAiChatElement);
```

Note: The above example assumes that the custom element 'ltp-ai-chat-element' has been defined and registered in the custom elements registry.