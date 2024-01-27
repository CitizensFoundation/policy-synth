# LtpCurrentRealityTreeConnector

This class extends `YpBaseElement` to provide functionality specific to connecting elements in the Current Reality Tree (CRT) within the LTP (Logical Thinking Process) framework. It manages the display and interaction logic for a node within the CRT, including editing nodes and toggling menus.

## Properties

| Name          | Type    | Description                                                                 |
|---------------|---------|-----------------------------------------------------------------------------|
| nodeId        | String  | The unique identifier of the node.                                          |
| crtNodeType   | String  | The type of the CRT node.                                                   |
| crtId         | String  | The identifier of the CRT this node belongs to.                             |
| isCreatingCauses | Boolean | A flag indicating whether causes are being created for this node.           |
| api           | LtpServerApi | An instance of `LtpServerApi` for making API calls related to the CRT.      |

## Methods

| Name                  | Parameters                                             | Return Type | Description                                                                 |
|-----------------------|--------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor           |                                                        |             | Initializes the component, setting up the API instance.                     |
| connectedCallback     |                                                        | Promise<void> | Lifecycle method for when the component is added to the document's DOM.     |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method for when the component's properties have changed.          |
| disconnectedCallback  |                                                        | void        | Lifecycle method for when the component is removed from the document's DOM. |
| editNode              |                                                        | void        | Triggers an event to edit the current node.                                 |
| toggleMenu            |                                                        | void        | Toggles the visibility of the menu associated with this node.               |
| render                |                                                        | TemplateResult | Renders the HTML template for the component.                                |

## Events

- `edit-node`: Fired when the node is requested to be edited. It includes the `nodeId` and the element itself.

## Example

```typescript
import { LtpCurrentRealityTreeConnector } from '@policysynth/webapp/ltp/ltp-current-reality-tree-connector.js';

// Usage in a LitElement template
html`
  <ltp-current-reality-tree-connector
    .nodeId="${this.nodeId}"
    .crtNodeType="${this.crtNodeType}"
    .crtId="${this.crtId}"
    .isCreatingCauses="${this.isCreatingCauses}"
  ></ltp-current-reality-tree-connector>
`;
```

This example demonstrates how to use the `LtpCurrentRealityTreeConnector` in a LitElement-based project. It shows how to bind properties such as `nodeId`, `crtNodeType`, `crtId`, and `isCreatingCauses` to the component.