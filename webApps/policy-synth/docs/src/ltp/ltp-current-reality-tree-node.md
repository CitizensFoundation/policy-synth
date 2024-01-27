# LtpCurrentRealityTreeNode

This class represents a node within the Current Reality Tree (CRT) in the LTP (Logical Thinking Process) module. It extends `YpBaseElement` to leverage common functionalities provided by the base element. The class is responsible for rendering the node, handling user interactions for editing the node, creating direct causes, and toggling additional options through a menu.

## Properties

| Name              | Type    | Description                                                                 |
|-------------------|---------|-----------------------------------------------------------------------------|
| nodeId            | String  | The unique identifier of the node.                                          |
| crtNodeType       | String  | The type of the CRT node (e.g., 'ude', 'directCause', 'intermediateCause'). |
| crtId             | String  | The identifier of the CRT this node belongs to.                             |
| isRootCause       | Boolean | Indicates if the node is a root cause.                                      |
| causeDescription  | String  | The description of the cause represented by the node.                       |
| isCreatingCauses  | Boolean | Indicates if the node is in the process of creating causes.                 |
| api               | LtpServerApi | An instance of `LtpServerApi` for making API calls.                         |

## Methods

| Name                  | Parameters                        | Return Type | Description                                                                 |
|-----------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| createDirectCauses    |                                   | Promise<void> | Asynchronously creates direct causes for the node and updates the UI.       |
| editNode              |                                   | void        | Triggers the edit node event with node details.                             |
| crtTypeIconClass      |                                   | String      | Determines the CSS class for the node type icon based on the node type.     |
| toggleMenu            |                                   | void        | Toggles the visibility of the menu associated with the node.                |
| crtTypeIcon           |                                   | String      | Determines the icon to be used based on the node type and if it's a root cause. |
| render                |                                   | TemplateResult | Renders the HTML template for the node, including description, icons, and action buttons. |

## Events

- `add-nodes`: Fired when new nodes are added as a result of creating direct causes.
- `edit-node`: Fired when the node is to be edited, providing the node ID and element reference.
- `open-add-cause-dialog`: Fired to open the dialog for adding a new cause, providing the parent node ID.

## Example

```typescript
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { LtpCurrentRealityTreeNode } from '@policysynth/webapp/ltp/ltp-current-reality-tree-node.js';

// Usage within a LitElement template
html`
  <ltp-current-reality-tree-node
    nodeId="123"
    crtNodeType="ude"
    crtId="crt1"
    isRootCause=${false}
    causeDescription="This is a sample cause description."
  ></ltp-current-reality-tree-node>
`;
```

This example demonstrates how to use the `ltp-current-reality-tree-node` custom element within a LitElement template, including setting its properties such as `nodeId`, `crtNodeType`, `crtId`, `isRootCause`, and `causeDescription`.