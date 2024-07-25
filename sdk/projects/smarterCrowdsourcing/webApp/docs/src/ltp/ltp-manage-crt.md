# LtpManageCrt

This class is responsible for managing the Current Reality Tree (CRT) within the application. It extends `PsStageBase` and utilizes various web components and APIs to create, edit, and display a CRT. It includes functionality for editing nodes, adding causes to nodes, and reviewing the tree configuration with AI assistance.

## Properties

| Name                                  | Type                                              | Description                                                                 |
|---------------------------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| currentTreeId                         | string \| number \| undefined                     | The ID of the current tree being managed.                                   |
| crt                                   | LtpCurrentRealityTreeData \| undefined            | The current reality tree data.                                              |
| isCreatingCrt                         | boolean                                           | Indicates if a CRT is currently being created.                              |
| isFetchingCrt                         | boolean                                           | Indicates if the CRT is currently being fetched.                            |
| nodeToEditInfo                        | CrtEditNodeInfo \| undefined                      | Information about the node to be edited.                                    |
| nodeToEdit                            | LtpCurrentRealityTreeDataNode \| undefined        | The node currently being edited.                                            |
| allCausesExceptCurrentToEdit          | LtpCurrentRealityTreeDataNode[]                   | All causes except the one currently being edited.                           |
| showDeleteConfirmation                | boolean                                           | Indicates if the delete confirmation dialog should be shown.                |
| activeTabIndex                        | number                                            | The index of the currently active tab.                                      |
| currentlySelectedCauseIdToAddAsChild  | string \| undefined                               | The ID of the currently selected cause to add as a child.                   |
| AIConfigReview                        | string \| undefined                               | The AI configuration review.                                                |
| isReviewingCrt                        | boolean                                           | Indicates if the CRT is currently being reviewed.                           |
| crtElement                            | LtpCurrentRealityTree                             | The CRT element.                                                            |
| api                                   | LtpServerApi                                      | The server API instance.                                                    |
| nodeToAddCauseTo                      | LtpCurrentRealityTreeDataNode \| undefined        | The node to which a cause is to be added.                                   |
| wsMessageListener                     | ((event: any) => void) \| undefined               | The WebSocket message listener.                                             |
| currentStreaminReponse                | LtpStreamingAIResponse \| undefined               | The current streaming AI response.                                          |

## Methods

| Name                        | Parameters                          | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback           |                                     | void        | Lifecycle method that runs when the component is added to the DOM.         |
| openEditNodeDialog          | event: CustomEvent                  | void        | Opens the dialog to edit a node.                                            |
| closeEditNodeDialog         |                                     | void        | Closes the edit node dialog.                                                |
| addChildChanged             |                                     | void        | Handles changes to the selected child to add.                              |
| handleSaveEditNode          |                                     | Promise<void> | Saves changes made to the node being edited.                              |
| handleDeleteNode            |                                     | void        | Handles the deletion of a node.                                             |
| removeNodeRecursively       | nodes: LtpCurrentRealityTreeDataNode[], nodeId: string | void | Recursively removes a node by ID.                                           |
| confirmDeleteNode           |                                     | Promise<void> | Confirms the deletion of a node.                                           |
| createDirectCauses          |                                     | void        | Creates direct causes for a node.                                           |
| closeDeleteConfirmationDialog |                                   | void        | Closes the delete confirmation dialog.                                      |
| renderDeleteConfirmationDialog |                                 | TemplateResult | Renders the delete confirmation dialog.                                    |
| renderEditNodeDialog        |                                     | TemplateResult | Renders the edit node dialog.                                              |
| updatePath                  |                                     | void        | Updates the browser path based on the current tree ID.                      |
| addChildToCurrentNode       |                                     | Promise<void> | Adds a child to the current node being edited.                             |
| findNodeById                | nodes: LtpCurrentRealityTreeDataNode[], id: string | LtpCurrentRealityTreeDataNode \| null | Finds a node by ID. |
| removeChildNode             | childIdToRemove: string             | Promise<void> | Removes a child node from the current node being edited.                   |
| fetchCurrentTree            |                                     | Promise<void> | Fetches the current tree data.                                             |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the component's properties change.         |
| disconnectedCallback        |                                     | void        | Lifecycle method that runs when the component is removed from the DOM.     |
| camelCaseToHumanReadable    | str: string                         | string      | Converts a camelCase string to a human-readable format.                     |
| tabChanged                  |                                     | void        | Handles changes to the active tab.                                          |
| clearForNew                 |                                     | void        | Clears the form for creating a new tree.                                    |
| reviewTreeConfiguration     |                                     | Promise<void> | Reviews the tree configuration with AI assistance.                         |
| createTree                  |                                     | Promise<void> | Creates a new CRT based on the input data.                                 |
| toggleDarkMode              |                                     | void        | Toggles the dark mode theme.                                                |
| randomizeTheme              |                                     | void        | Randomizes the theme color.                                                 |
| renderAIConfigReview        |                                     | TemplateResult | Renders the AI configuration review.                                       |
| renderReviewAndSubmit       |                                     | TemplateResult | Renders the review and submit buttons.                                     |
| renderThemeToggle           |                                     | TemplateResult | Renders the theme toggle buttons.                                          |
| renderConfiguration         |                                     | TemplateResult | Renders the CRT configuration form.                                        |
| findNodeRecursively         | nodes: LtpCurrentRealityTreeDataNode[], nodeId: string | LtpCurrentRealityTreeDataNode \| undefined | Recursively finds a node by ID. |
| openAddCauseDialog          | event: CustomEvent                  | void        | Opens the dialog to add a cause to a node.                                 |
| closeAddCauseDialog         |                                     | void        | Closes the add cause dialog.                                                |
| renderAddCauseDialog        |                                     | TemplateResult | Renders the add cause dialog.                                              |
| render                      |                                     | any         | Renders the component.                                                      |

## Example

```typescript
import '@policysynth/webapp/ltp/ltp-manage-crt.js';

// Example of using the LtpManageCrt component in a LitElement template
html`
  <ltp-manage-crt></ltp-manage-crt>
`;
```

This example demonstrates how to import and use the `LtpManageCrt` component within a LitElement template.