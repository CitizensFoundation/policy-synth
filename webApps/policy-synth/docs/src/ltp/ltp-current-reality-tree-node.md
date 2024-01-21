# LtpCurrentRealityTreeNode

`LtpCurrentRealityTreeNode` is a custom web component that represents a node within a current reality tree structure. It extends `YpBaseElement` and provides functionality to create direct causes, edit nodes, and display node information.

## Properties

| Name               | Type      | Description                                           |
|--------------------|-----------|-------------------------------------------------------|
| nodeId             | string    | The unique identifier for the node.                   |
| crtNodeType        | string    | The type of the current reality tree node.            |
| crtId              | string    | The identifier for the current reality tree.          |
| isRootCause        | boolean   | Indicates if the node is a root cause.                |
| causeDescription   | string    | The description of the cause associated with the node.|
| isCreatingCauses   | boolean   | Indicates if the node is in the process of creating causes. |

## Methods

| Name                  | Parameters                        | Return Type | Description                                      |
|-----------------------|-----------------------------------|-------------|--------------------------------------------------|
| createDirectCauses    |                                   | Promise<void> | Initiates the creation of direct causes for the node. |
| editNode              |                                   | void        | Triggers the edit node action.                   |
| crtTypeIconClass      |                                   | string      | Returns the class for the node type icon based on the node type. |
| toggleMenu            |                                   | void        | Toggles the visibility of the node's menu.       |
| crtTypeIcon           |                                   | string      | Returns the icon name based on the node type.    |

## Events

- **add-nodes**: Emitted when new nodes are added to the current reality tree.
- **edit-node**: Emitted when the node is requested to be edited.
- **open-add-cause-dialog**: Emitted when the dialog to add a new cause is requested to be opened.

## Examples

```typescript
// Example usage of the LtpCurrentRealityTreeNode component
<ltp-current-reality-tree-node
  nodeId="node123"
  crtNodeType="ude"
  crtId="crt456"
  isRootCause={false}
  causeDescription="This is a description of the cause."
  isCreatingCauses={false}
></ltp-current-reality-tree-node>
```

Please note that the above example is a representation of how the component might be used in HTML and does not include the full functionality that would be present in a complete web application environment.