# LtpCurrentRealityTreeConnector

The `LtpCurrentRealityTreeConnector` class is a web component that extends `YpBaseElement`. It is used to represent a connector within a current reality tree, allowing for the editing and interaction with nodes.

## Properties

| Name            | Type    | Description                                           |
|-----------------|---------|-------------------------------------------------------|
| nodeId          | String  | The unique identifier for the node.                   |
| crtNodeType     | String  | The type of the current reality tree node.            |
| crtId           | String  | The identifier for the current reality tree.          |
| isCreatingCauses| Boolean | Indicates whether causes are being created or not.    |
| api             | LtpServerApi | An instance of `LtpServerApi` for server interactions. |

## Methods

| Name                   | Parameters                                      | Return Type | Description                                 |
|------------------------|-------------------------------------------------|-------------|---------------------------------------------|
| connectedCallback      |                                                 | void        | Lifecycle method for when the component is added to the DOM. |
| updated                | changedProperties: PropertyValueMap            | void        | Lifecycle method for when the component's properties have changed. |
| disconnectedCallback   |                                                 | void        | Lifecycle method for when the component is removed from the DOM. |
| editNode               |                                                 | void        | Method to handle the editing of a node. |
| toggleMenu             |                                                 | void        | Method to toggle the visibility of the menu. |
| render                 |                                                 | TemplateResult | Method to define the component's HTML structure. |

## Events

- **edit-node**: Emitted when the node is to be edited, providing the `nodeId` and the element itself.

## Examples

```typescript
// Example usage of the LtpCurrentRealityTreeConnector
<ltp-current-reality-tree-connector
  nodeId="123"
  crtNodeType="Goal"
  crtId="crt-456"
></ltp-current-reality-tree-connector>
```

## Styles

The component includes styles for various elements such as `.causeType`, `md-icon-button[root-cause]`, `md-circular-progress`, and `md-menu`, which are used to style the appearance of the connector and its interactive elements.