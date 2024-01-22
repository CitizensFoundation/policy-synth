# LtpManageCrt

`LtpManageCrt` is a custom element that manages the creation, configuration, and editing of a Current Reality Tree (CRT). It provides a user interface for inputting the context and undesirable effects, reviewing the tree configuration with AI assistance, and editing nodes within the tree.

## Properties

| Name                                  | Type                                      | Description                                                                 |
|---------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| currentTreeId                         | string \| number \| undefined             | The ID of the current tree being managed.                                   |
| crt                                   | LtpCurrentRealityTreeData \| undefined    | The current reality tree data object.                                       |
| isCreatingCrt                         | boolean                                   | Indicates if a CRT is currently being created.                              |
| isFetchingCrt                         | boolean                                   | Indicates if the CRT data is currently being fetched.                       |
| nodeToEditInfo                        | CrtEditNodeInfo \| undefined              | Information about the node to be edited.                                    |
| nodeToEdit                            | LtpCurrentRealityTreeDataNode \| undefined| The node currently being edited.                                            |
| allCausesExceptCurrentToEdit          | LtpCurrentRealityTreeDataNode[]           | An array of all causes except the one currently being edited.               |
| showDeleteConfirmation                | boolean                                   | Indicates if the delete confirmation dialog should be shown.                |
| activeTabIndex                        | number                                    | The index of the currently active tab.                                      |
| currentlySelectedCauseIdToAddAsChild  | string \| undefined                       | The ID of the cause selected to be added as a child to the current node.    |
| AIConfigReview                        | string \| undefined                       | The AI-generated review of the CRT configuration.                           |
| isReviewingCrt                        | boolean                                   | Indicates if the CRT configuration is currently being reviewed.             |
| nodeToAddCauseTo                      | LtpCurrentRealityTreeDataNode \| undefined| The node to which a cause is to be added.                                   |
| wsMessageListener                     | ((event: any) => void) \| undefined       | A listener for WebSocket messages.                                          |
| currentStreaminReponse                | LtpStreamingAIResponse \| undefined       | The current streaming AI response object.                                   |

## Methods

| Name                      | Parameters                  | Return Type | Description                                                                 |
|---------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| openEditNodeDialog        | event: CustomEvent          | void        | Opens the dialog to edit a node.                                            |
| closeEditNodeDialog       |                             | void        | Closes the edit node dialog.                                                |
| addChildChanged           |                             | void        | Handles changes to the selected child to add as an effect.                  |
| handleSaveEditNode        |                             | void        | Saves the changes made to the node being edited.                            |
| handleDeleteNode          |                             | void        | Handles the deletion of a node.                                             |
| confirmDeleteNode         |                             | void        | Confirms the deletion of a node.                                            |
| createDirectCauses        |                             | void        | Creates direct causes for a node (used for testing).                        |
| closeDeleteConfirmationDialog |                       | void        | Closes the delete confirmation dialog.                                      |
| renderDeleteConfirmationDialog |                      | TemplateResult | Renders the delete confirmation dialog.                                    |
| renderEditNodeDialog      |                             | TemplateResult | Renders the edit node dialog.                                              |
| updatePath                |                             | void        | Updates the browser path with the current tree ID.                          |
| addChildToCurrentNode     |                             | Promise<void> | Adds a child to the current node being edited.                             |
| removeChildNode           | childIdToRemove: string     | Promise<void> | Removes a child node from the current node being edited.                   |
| fetchCurrentTree          |                             | Promise<void> | Fetches the current tree data.                                             |
| camelCaseToHumanReadable  | str: string                 | string      | Converts a camelCase string to a human-readable format.                     |
| tabChanged                |                             | void        | Handles changes to the active tab.                                         |
| clearForNew               |                             | void        | Clears the form for creating a new CRT.                                    |
| reviewTreeConfiguration   |                             | Promise<void> | Reviews the CRT configuration with AI assistance.                          |
| createTree                |                             | Promise<void> | Creates a new CRT based on the input data.                                 |
| toggleDarkMode            |                             | void        | Toggles the dark mode theme.                                               |
| randomizeTheme            |                             | void        | Randomizes the theme color.                                                |
| renderAIConfigReview      |                             | TemplateResult | Renders the AI configuration review.                                      |
| renderReviewAndSubmit     |                             | TemplateResult | Renders the review and submit buttons.                                    |
| renderThemeToggle         |                             | TemplateResult | Renders the theme toggle button.                                          |
| renderConfiguration       |                             | TemplateResult | Renders the configuration form.                                           |
| findNodeRecursively       | nodes: LtpCurrentRealityTreeDataNode[], nodeId: string | LtpCurrentRealityTreeDataNode \| undefined | Recursively finds a node by ID. |
| openAddCauseDialog        | event: CustomEvent          | void        | Opens the dialog to add a cause to a node.                                 |
| closeAddCauseDialog       |                             | void        | Closes the add cause dialog.                                               |
| renderAddCauseDialog      |                             | TemplateResult | Renders the add cause dialog.                                             |
| render                    |                             | TemplateResult | Renders the component.                                                    |

## Events (if any)

- **open-add-cause-dialog**: Emitted when the dialog to add a cause to a node is opened.
- **close-add-cause-dialog**: Emitted when the dialog to add a cause to a node is closed.
- **edit-node**: Emitted when a node is to be edited.
- **wsMessage**: Emitted when a WebSocket message is received.

## Examples

```typescript
// Example usage of the LtpManageCrt component
<ltp-manage-crt></ltp-manage-crt>
```

Note: The above documentation is a high-level overview of the `LtpManageCrt` class and does not include all properties, methods, events, and internal logic. The actual implementation may include additional functionality and complexity not captured here.