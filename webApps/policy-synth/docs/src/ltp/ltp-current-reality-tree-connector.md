# LtpCurrentRealityTreeConnector

This class is a custom element that connects the current reality tree (CRT) node with the LTP server API. It extends `YpBaseElement` to leverage common functionalities provided by the base element. The component is designed to display and interact with a specific node in the CRT, allowing users to edit the node and toggle additional options through a menu.

## Properties

| Name          | Type    | Description                                                                 |
|---------------|---------|-----------------------------------------------------------------------------|
| nodeId        | String  | The unique identifier of the node.                                          |
| crtNodeType   | String  | The type of the CRT node.                                                   |
| crtId         | String  | The identifier of the current reality tree this node belongs to.            |
| isCreatingCauses | Boolean | A flag indicating whether causes are being created for the node.            |
| api           | LtpServerApi | An instance of `LtpServerApi` to interact with the LTP server.              |

## Methods

| Name                  | Parameters                                       | Return Type | Description                                                                 |
|-----------------------|--------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     |                                                  | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the element's properties change.            |
| disconnectedCallback  |                                                  | void        | Lifecycle method that runs when the element is removed from the document's DOM. |
| editNode              |                                                  | void        | Emits an "edit-node" event with the node's ID and element reference.        |
| toggleMenu            |                                                  | void        | Toggles the visibility of the menu associated with the node.                |

## Events

- `edit-node`: Fired when the user requests to edit the node. It includes the node's ID and a reference to the element.

## Styles

The component defines several custom styles for its internal elements, such as `.causeType`, `md-icon-button[root-cause]`, `md-circular-progress`, and `md-menu`, to ensure a consistent and visually appealing interface.

## Example

```typescript
import '@policysynth/webapp/ltp/ltp-current-reality-tree-connector.js';

// Usage in HTML
<ltp-current-reality-tree-connector
  nodeId="node123"
  crtNodeType="Goal"
  crtId="crt1"
></ltp-current-reality-tree-connector>
```

This example demonstrates how to use the `ltp-current-reality-tree-connector` custom element in an HTML document. It specifies the `nodeId`, `crtNodeType`, and `crtId` properties to configure the element for a specific node in the current reality tree.