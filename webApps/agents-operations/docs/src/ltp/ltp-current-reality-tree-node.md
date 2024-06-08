# LtpCurrentRealityTreeNode

This class represents a node within the Current Reality Tree (CRT) in the LTP (Logical Thinking Process) application. It extends `YpBaseElement` to leverage common functionalities and lifecycle hooks provided by the base element. The node is responsible for displaying cause descriptions, managing its state (e.g., whether it's a root cause or creating causes), and interacting with the `LtpServerApi` for data operations.

## Properties

| Name              | Type    | Description                                                                 |
|-------------------|---------|-----------------------------------------------------------------------------|
| nodeId            | String  | The unique identifier of the node.                                          |
| crtNodeType       | String  | The type of the CRT node (e.g., 'ude', 'directCause', 'intermediateCause'). |
| crtId             | String  | The identifier of the CRT this node belongs to.                             |
| isRootCause       | Boolean | Indicates if the node is a root cause.                                      |
| causeDescription  | String  | The description of the cause represented by this node.                      |
| isCreatingCauses  | Boolean | Indicates if the node is in the process of creating direct causes.          |
| api               | LtpServerApi | An instance of `LtpServerApi` for server interactions.                    |

## Methods

| Name                  | Parameters | Return Type | Description                                                                 |
|-----------------------|------------|-------------|-----------------------------------------------------------------------------|
| createDirectCauses    | -          | Promise<void> | Initiates the creation of direct causes for this node.                     |
| editNode              | -          | void        | Triggers the edit node event with node details.                             |
| crtTypeIconClass      | -          | String      | Computes the CSS class for the node type icon based on the `crtNodeType`.   |
| toggleMenu            | -          | void        | Toggles the visibility of the node's menu.                                  |
| crtTypeIcon           | -          | String      | Determines the icon to display based on the node type and `isRootCause`.    |
| render                | -          | TemplateResult | Renders the node's HTML structure with Lit's `html` template function.   |

## Events

- `add-nodes`: Fired when new nodes are added as a result of creating direct causes.
- `edit-node`: Fired when the node is to be edited, providing the node ID and element reference.
- `open-add-cause-dialog`: Fired to request opening the dialog to add a new cause, providing the parent node ID.

## Example

```typescript
import '@policysynth/webapp/ltp/ltp-current-reality-tree-node.js';

// Usage within a LitElement component
render() {
  return html`
    <ltp-current-reality-tree-node
      nodeId="123"
      crtNodeType="ude"
      crtId="crt1"
      isRootCause=${false}
      causeDescription="Example cause description."
    ></ltp-current-reality-tree-node>
  `;
}
```

This example demonstrates how to use the `ltp-current-reality-tree-node` custom element within another LitElement component. It sets the necessary properties such as `nodeId`, `crtNodeType`, `crtId`, `isRootCause`, and `causeDescription` to display a node of the Current Reality Tree.