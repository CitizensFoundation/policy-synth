# LtpManageCrt

`LtpManageCrt` is a custom element that manages the creation, configuration, and editing of a Current Reality Tree (CRT) within a web application. It provides a user interface for users to input the context and undesirable effects of a situation, review the configuration with AI assistance, and create or edit nodes within the CRT.

## Properties

| Name                                  | Type                                      | Description                                                                 |
|---------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| currentTreeId                         | string \| number \| undefined             | The ID of the current tree being managed.                                   |
| crt                                   | LtpCurrentRealityTreeData \| undefined    | The current reality tree data object.                                       |
| isCreatingCrt                         | boolean                                   | Indicates if a CRT is currently being created.                              |
| isFetchingCrt                         | boolean                                   | Indicates if a CRT is currently being fetched.                              |
| nodeToEditInfo                        | CrtEditNodeInfo \| undefined              | Information about the node to be edited.                                    |
| nodeToEdit                            | LtpCurrentRealityTreeDataNode \| undefined| The node currently being edited.                                            |
| allCausesExceptCurrentToEdit          | LtpCurrentRealityTreeDataNode[]           | An array of all causes except the one currently being edited.               |
| showDeleteConfirmation                | boolean                                   | Indicates if the delete confirmation dialog should be shown.                 |
| activeTabIndex                        | number                                    | The index of the currently active tab.                                      |
| currentlySelectedCauseIdToAddAsChild  | string \| undefined                       | The ID of the cause currently selected to be added as a child.              |
| AIConfigReview                        | string \| undefined                       | The AI configuration review text.                                           |
| isReviewingCrt                        | boolean                                   | Indicates if the CRT is currently being reviewed.                           |
| nodeToAddCauseTo                      | LtpCurrentRealityTreeDataNode \| undefined| The node to which a cause is to be added.                                   |

## Methods

| Name                     | Parameters                  | Return Type | Description                                                                 |
|--------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| openEditNodeDialog       | event: CustomEvent          | void        | Opens the dialog to edit a node.                                            |
| closeEditNodeDialog      |                             | void        | Closes the edit node dialog.                                                |
| addChildChanged          |                             | void        | Handles changes to the selected child to add as a cause.                    |
| handleSaveEditNode       |                             | void        | Saves the changes made to the node being edited.                            |
| handleDeleteNode         |                             | void        | Handles the deletion of a node.                                             |
| confirmDeleteNode        |                             | void        | Confirms the deletion of a node.                                            |
| createDirectCauses       |                             | void        | Creates direct causes for a node.                                           |
| closeDeleteConfirmationDialog |                     | void        | Closes the delete confirmation dialog.                                      |
| updatePath               |                             | void        | Updates the browser path to reflect the current tree.                       |
| addChildToCurrentNode    |                             | Promise<void>| Adds a child node to the current node being edited.                        |
| removeChildNode          | childIdToRemove: string     | Promise<void>| Removes a child node from the current node being edited.                  |
| fetchCurrentTree         |                             | Promise<void>| Fetches the current tree data.                                             |
| reviewTreeConfiguration  |                             | Promise<void>| Initiates the review of the tree configuration with AI assistance.          |
| createTree               |                             | Promise<void>| Creates a new CRT based on the provided configuration.                      |
| toggleDarkMode           |                             | void        | Toggles the dark mode theme.                                                |
| randomizeTheme           |                             | void        | Randomizes the theme color.                                                 |
| openAddCauseDialog       | event: CustomEvent          | void        | Opens the dialog to add a cause to a node.                                  |
| closeAddCauseDialog      |                             | void        | Closes the add cause dialog.                                                |

## Events (if any)

- **open-add-cause-dialog**: Emitted when the dialog to add a cause to a node is to be opened.
- **close-add-cause-dialog**: Emitted when the dialog to add a cause to a node is to be closed.
- **edit-node**: Emitted when a node is to be edited.
- **wsMessage**: Emitted when a WebSocket message is received during AI review.

## Examples

```typescript
// Example usage of the LtpManageCrt element
<ltp-manage-crt></ltp-manage-crt>
```

Note: The above example is a simple usage scenario. The actual use of `LtpManageCrt` involves interaction with various methods and properties to manage the CRT effectively.